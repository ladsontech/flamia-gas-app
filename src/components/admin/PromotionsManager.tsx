
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface PromotionalOffer {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const PromotionsManager: React.FC = () => {
  const [promotions, setPromotions] = useState<PromotionalOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<PromotionalOffer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    image_url: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('promotional_offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch promotional offers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingPromotion) {
        // Update existing promotion
        const { error } = await supabase
          .from('promotional_offers')
          .update({
            title: formData.title,
            description: formData.description || null,
            price: formData.price || null,
            image_url: formData.image_url || null
          })
          .eq('id', editingPromotion.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Promotional offer updated successfully!"
        });
      } else {
        // Create new promotion
        const { error } = await supabase
          .from('promotional_offers')
          .insert([{
            title: formData.title,
            description: formData.description || null,
            price: formData.price || null,
            image_url: formData.image_url || null
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Promotional offer created successfully!"
        });
      }

      // Reset form and refresh data
      setFormData({ title: '', description: '', price: '', image_url: '' });
      setEditingPromotion(null);
      setShowForm(false);
      fetchPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast({
        title: "Error",
        description: "Failed to save promotional offer",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (promotion: PromotionalOffer) => {
    setEditingPromotion(promotion);
    setFormData({
      title: promotion.title,
      description: promotion.description || '',
      price: promotion.price || '',
      image_url: promotion.image_url || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotional offer?')) return;

    try {
      const { error } = await supabase
        .from('promotional_offers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Promotional offer deleted successfully!"
      });
      
      fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast({
        title: "Error",
        description: "Failed to delete promotional offer",
        variant: "destructive"
      });
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('promotional_offers')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Promotional offer ${!isActive ? 'activated' : 'deactivated'} successfully!`
      });
      
      fetchPromotions();
    } catch (error) {
      console.error('Error toggling promotion status:', error);
      toast({
        title: "Error",
        description: "Failed to update promotional offer status",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', price: '', image_url: '' });
    setEditingPromotion(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Promotional Offers</h2>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Promotion
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPromotion ? 'Edit Promotional Offer' : 'Add New Promotional Offer'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                      placeholder="Enter promotion title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter promotion description"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="e.g., UGX 150,000"
                    />
                  </div>
                </div>

                <div>
                  <ImageUpload
                    bucket="promotions"
                    currentImage={formData.image_url}
                    onUploadComplete={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                    title="Promotion Image"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingPromotion ? 'Update' : 'Create'} Promotion
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Promotions List */}
      <div className="grid gap-4">
        {promotions.map((promotion) => (
          <Card key={promotion.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {promotion.image_url && (
                  <img
                    src={promotion.image_url}
                    alt={promotion.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{promotion.title}</h3>
                  {promotion.description && (
                    <p className="text-gray-600 mt-1">{promotion.description}</p>
                  )}
                  {promotion.price && (
                    <p className="text-green-600 font-semibold mt-2">{promotion.price}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Status: {promotion.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(promotion.id, promotion.is_active)}
                  >
                    {promotion.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(promotion)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(promotion.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {promotions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No promotional offers found. Create your first promotion!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PromotionsManager;
