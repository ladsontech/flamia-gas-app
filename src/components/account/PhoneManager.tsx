
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Edit2, Save, X, Plus } from 'lucide-react';

interface Profile {
  phone_number?: string;
  additional_phone_number?: string;
}

export const PhoneManager = () => {
  const [profile, setProfile] = useState<Profile>({});
  const [loading, setLoading] = useState(true);
  const [editingPrimary, setEditingPrimary] = useState(false);
  const [editingAdditional, setEditingAdditional] = useState(false);
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [additionalPhone, setAdditionalPhone] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('phone_number, additional_phone_number')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
        setPrimaryPhone(data.phone_number || '');
        setAdditionalPhone(data.additional_phone_number || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
      return '+256' + cleaned.slice(1);
    }
    
    if (!cleaned.startsWith('256') && !phone.startsWith('+')) {
      return '+256' + cleaned;
    }
    
    if (cleaned.startsWith('256') && !phone.startsWith('+')) {
      return '+' + cleaned;
    }
    
    return phone;
  };

  const handleSavePrimary = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const formattedPhone = primaryPhone ? formatPhoneNumber(primaryPhone) : null;

      const { error } = await supabase
        .from('profiles')
        .update({ phone_number: formattedPhone })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev, phone_number: formattedPhone || undefined }));
      setEditingPrimary(false);

      toast({
        title: "Success",
        description: "Primary phone number updated successfully"
      });
    } catch (error: any) {
      console.error('Error updating phone number:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update phone number",
        variant: "destructive"
      });
    }
  };

  const handleSaveAdditional = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const formattedPhone = additionalPhone ? formatPhoneNumber(additionalPhone) : null;

      const { error } = await supabase
        .from('profiles')
        .update({ additional_phone_number: formattedPhone })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev, additional_phone_number: formattedPhone || undefined }));
      setEditingAdditional(false);

      toast({
        title: "Success",
        description: "Additional phone number updated successfully"
      });
    } catch (error: any) {
      console.error('Error updating phone number:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update phone number",
        variant: "destructive"
      });
    }
  };

  const handleCancelPrimary = () => {
    setPrimaryPhone(profile.phone_number || '');
    setEditingPrimary(false);
  };

  const handleCancelAdditional = () => {
    setAdditionalPhone(profile.additional_phone_number || '');
    setEditingAdditional(false);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 sm:p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Phone className="w-5 h-5 text-primary" />
          <span>Phone Numbers</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-4 sm:p-6 pt-0">
        {/* Primary Phone Number */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">
              Primary Phone Number
            </Label>
            {!editingPrimary && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingPrimary(true)}
                className="h-8"
              >
                {profile.phone_number ? (
                  <>
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </>
                )}
              </Button>
            )}
          </div>

          {editingPrimary ? (
            <div className="space-y-3">
              <Input
                type="tel"
                placeholder="+256789123456 or 0789123456"
                value={primaryPhone}
                onChange={(e) => setPrimaryPhone(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                This number will be used for account verification and important notifications
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button size="sm" onClick={handleSavePrimary} className="flex-1 sm:flex-none">
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelPrimary} className="flex-1 sm:flex-none">
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-1">
                {profile.phone_number || 'Not set'}
              </p>
              <p className="text-xs text-gray-500">
                Main phone number for account verification
              </p>
            </div>
          )}
        </div>

        {/* Additional Phone Number */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">
              Emergency Contact Number
            </Label>
            {!editingAdditional && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingAdditional(true)}
                className="h-8"
              >
                {profile.additional_phone_number ? (
                  <>
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </>
                )}
              </Button>
            )}
          </div>

          {editingAdditional ? (
            <div className="space-y-3">
              <Input
                type="tel"
                placeholder="+256789123456 or 0789123456"
                value={additionalPhone}
                onChange={(e) => setAdditionalPhone(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                This number can be used as an emergency contact for deliveries
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button size="sm" onClick={handleSaveAdditional} className="flex-1 sm:flex-none">
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelAdditional} className="flex-1 sm:flex-none">
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-1">
                {profile.additional_phone_number || 'Not set'}
              </p>
              <p className="text-xs text-gray-500">
                Emergency contact number for delivery calls
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
