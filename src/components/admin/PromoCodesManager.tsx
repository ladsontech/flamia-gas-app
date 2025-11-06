import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, Tag } from 'lucide-react';

interface PromoCode {
  id: string;
  code: string;
  discount_amount: number;
  description: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export const PromoCodesManager: React.FC = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    code: '',
    discount_amount: '',
    description: '',
    is_active: true,
    expires_at: '',
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromoCodes(data || []);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      toast({
        title: "Error",
        description: "Failed to load promo codes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const promoData = {
        code: formData.code.toLowerCase().trim(),
        discount_amount: parseFloat(formData.discount_amount),
        description: formData.description || null,
        is_active: formData.is_active,
        expires_at: formData.expires_at || null,
      };

      if (editingPromo) {
        const { error } = await supabase
          .from('promo_codes')
          .update(promoData)
          .eq('id', editingPromo.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Promo code updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('promo_codes')
          .insert(promoData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Promo code created successfully",
        });
      }

      resetForm();
      fetchPromoCodes();
    } catch (error: any) {
      console.error('Error saving promo code:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save promo code",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      discount_amount: promo.discount_amount.toString(),
      description: promo.description || '',
      is_active: promo.is_active,
      expires_at: promo.expires_at ? promo.expires_at.split('T')[0] : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;

    try {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Promo code deleted successfully",
      });

      fetchPromoCodes();
    } catch (error) {
      console.error('Error deleting promo code:', error);
      toast({
        title: "Error",
        description: "Failed to delete promo code",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Promo code ${!isActive ? 'activated' : 'deactivated'}`,
      });

      fetchPromoCodes();
    } catch (error) {
      console.error('Error toggling promo code:', error);
      toast({
        title: "Error",
        description: "Failed to update promo code",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount_amount: '',
      description: '',
      is_active: true,
      expires_at: '',
    });
    setEditingPromo(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading promo codes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Tag className="w-5 h-5 sm:w-6 sm:h-6" />
            Promo Codes Manager
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Create and manage discount codes for gas orders
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-accent hover:bg-accent/90 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Promo Code'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingPromo ? 'Edit Promo Code' : 'Create New Promo Code'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., SAVE20"
                  required
                  disabled={!!editingPromo}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Code will be converted to lowercase
                </p>
              </div>

              <div>
                <Label>Discount Amount (UGX) *</Label>
                <Input
                  type="number"
                  value={formData.discount_amount}
                  onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
                  placeholder="e.g., 5000"
                  required
                  min="0"
                  step="1000"
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this promo code..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Expiration Date (Optional)</Label>
                <Input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={saving} className="bg-accent hover:bg-accent/90">
                {saving ? 'Saving...' : editingPromo ? 'Update' : 'Create'}
              </Button>
              {editingPromo && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {promoCodes.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-sm">No promo codes yet. Create your first one!</p>
          </Card>
        ) : (
          promoCodes.map((promo) => (
            <Card key={promo.id} className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-start sm:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-base sm:text-lg font-semibold uppercase break-all">{promo.code}</h3>
                    <span className="text-lg sm:text-xl font-bold text-orange-600 whitespace-nowrap">
                      -{promo.discount_amount.toLocaleString()} UGX
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${promo.is_active ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'}`}>
                      {promo.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {promo.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 break-words">{promo.description}</p>
                  )}
                  <div className="text-xs text-muted-foreground">
                    <div>Created: {new Date(promo.created_at).toLocaleDateString()}</div>
                    {promo.expires_at && (
                      <div className="mt-1">
                        Expires: {new Date(promo.expires_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex sm:flex-col gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(promo)}
                    className="flex-1 sm:flex-none"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(promo.id, promo.is_active)}
                    className="flex-1 sm:flex-none text-xs sm:text-sm whitespace-nowrap"
                  >
                    {promo.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(promo.id)}
                    className="flex-1 sm:flex-none"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};