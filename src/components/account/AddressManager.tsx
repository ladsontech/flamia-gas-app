
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Plus, Edit, Trash2, Star } from 'lucide-react';
import { LocationPicker } from '@/components/order/LocationPicker';

interface Address {
  id: string;
  label: string;
  address_line: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
}

export const AddressManager = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    address_line: '',
    city: 'Kampala',
    latitude: null as number | null,
    longitude: null as number | null,
    is_default: false
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error: any) {
      console.error('Error fetching addresses:', error);
      toast({
        title: "Error",
        description: "Failed to load addresses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setFormData(prev => ({
      ...prev,
      address_line: location.address,
      latitude: location.lat,
      longitude: location.lng
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const addressData = {
        label: formData.label,
        address_line: formData.address_line,
        city: formData.city,
        latitude: formData.latitude,
        longitude: formData.longitude,
        is_default: formData.is_default,
        user_id: user.id
      };

      if (editingAddress) {
        const { error } = await supabase
          .from('addresses')
          .update(addressData)
          .eq('id', editingAddress.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Address updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('addresses')
          .insert([addressData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Address added successfully"
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchAddresses();
    } catch (error: any) {
      console.error('Error saving address:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save address",
        variant: "destructive"
      });
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      // First, remove default from all addresses
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .neq('id', addressId);

      // Then set the selected address as default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Default address updated"
      });

      fetchAddresses();
    } catch (error: any) {
      console.error('Error setting default address:', error);
      toast({
        title: "Error",
        description: "Failed to update default address",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Address deleted successfully"
      });

      fetchAddresses();
    } catch (error: any) {
      console.error('Error deleting address:', error);
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      label: '',
      address_line: '',
      city: 'Kampala',
      latitude: null,
      longitude: null,
      is_default: false
    });
    setEditingAddress(null);
  };

  const openEditDialog = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      address_line: address.address_line,
      city: address.city || 'Kampala',
      latitude: address.latitude,
      longitude: address.longitude,
      is_default: address.is_default
    });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 sm:p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-lg">My Addresses</span>
          </div>
          {addresses.length === 0 && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={resetForm} className="h-8">
                  <Plus className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Add Address</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="label" className="text-sm font-medium">
                    Nearby Location Name
                  </Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g., Near Nakumatt, Close to Bank of Uganda, etc."
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a nearby landmark or location name for easy identification
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Select Location on Map
                  </Label>
                  <div className="h-64 sm:h-80">
                    <LocationPicker
                      onLocationSelect={handleLocationSelect}
                      selectedLocation={
                        formData.latitude && formData.longitude
                          ? {
                              lat: formData.latitude,
                              lng: formData.longitude,
                              address: formData.address_line
                            }
                          : null
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="city" className="text-sm font-medium">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Kampala"
                    className="mt-1"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 sm:flex-none">
                    {editingAddress ? 'Update Address' : 'Add Address'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        {addresses.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4 text-sm">No delivery address set yet</p>
            <Button onClick={() => setIsDialogOpen(true)} size="sm">
              Add Your Delivery Address
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div key={address.id} className="border rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm truncate">{address.label}</span>
                        {address.is_default && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary text-primary-foreground shrink-0">
                            <Star className="w-3 h-3 mr-1" />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1 break-words">{address.address_line}</p>
                      <p className="text-xs text-gray-500">{address.city}</p>
                    </div>
                  </div>
                  
                   <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(address)}
                      className="text-xs h-8 flex-1 sm:flex-none"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit Address
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
