
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, Store, RefreshCw, AlertCircle } from 'lucide-react';
import { Business } from '@/types/business';
import { fetchBusinesses, createBusiness, updateBusiness, deleteBusiness } from '@/services/businessService';
import ImageUpload from './ImageUpload';

const BusinessesManager: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contact: '',
    description: '',
    is_featured: false,
    is_active: true,
    image_url: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Admin: Loading businesses...");
      const data = await fetchBusinesses();
      console.log("Admin: Businesses loaded:", data);
      setBusinesses(data);
      
      if (data.length === 0) {
        setError("No businesses found. Create your first business!");
      }
    } catch (error) {
      console.error('Admin: Error loading businesses:', error);
      const errorMsg = "Failed to load businesses";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingBusiness) {
        await updateBusiness(editingBusiness.id, formData);
        toast({
          title: "Success",
          description: "Business updated successfully"
        });
      } else {
        await createBusiness(formData);
        toast({
          title: "Success",
          description: "Business created successfully"
        });
      }
      
      resetForm();
      loadBusinesses();
    } catch (error) {
      console.error("Error saving business:", error);
      toast({
        title: "Error",
        description: "Failed to save business",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (business: Business) => {
    setEditingBusiness(business);
    setFormData({
      name: business.name,
      location: business.location,
      contact: business.contact,
      description: business.description || '',
      is_featured: business.is_featured,
      is_active: business.is_active,
      image_url: business.image_url || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this business?')) return;

    try {
      await deleteBusiness(id);
      toast({
        title: "Success",
        description: "Business deleted successfully"
      });
      loadBusinesses();
    } catch (error) {
      console.error("Error deleting business:", error);
      toast({
        title: "Error",
        description: "Failed to delete business",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      contact: '',
      description: '',
      is_featured: false,
      is_active: true,
      image_url: ''
    });
    setEditingBusiness(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Food Businesses</h2>
          <p className="text-gray-600">Manage food businesses and restaurants</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadBusinesses}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Business
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingBusiness ? 'Edit Business' : 'Add New Business'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Business Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    placeholder="e.g., Pizza Palace"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                    placeholder="e.g., Kampala, Uganda"
                  />
                </div>
                <div>
                  <Label htmlFor="contact">WhatsApp Contact</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    placeholder="+256700000000"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  placeholder="Brief description of the business..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageUpload
                  bucket="promotions"
                  onUploadComplete={(url) => setFormData({...formData, image_url: url})}
                  currentImage={formData.image_url}
                  title="Business Image"
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})}
                  />
                  <Label htmlFor="featured">Featured (appears at top)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingBusiness ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading && !showForm && (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Loading businesses...</p>
        </div>
      )}

      {error && !loading && !showForm && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <p className="text-orange-600 mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={loadBusinesses}
          >
            Try again
          </Button>
        </div>
      )}

      {!loading && !error && businesses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses.map((business) => (
            <Card key={business.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Store className="w-4 h-4" />
                    <h3 className="font-semibold">{business.name}</h3>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(business)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(business.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-1">{business.location}</p>
                <p className="text-sm text-gray-600 mb-2">{business.contact}</p>
                {business.description && (
                  <p className="text-xs text-gray-500 mb-2">{business.description}</p>
                )}
                
                <div className="flex space-x-2">
                  {business.is_featured && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Featured
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded ${
                    business.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {business.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessesManager;
