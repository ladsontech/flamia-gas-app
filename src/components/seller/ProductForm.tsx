import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { fetchSubcategories } from '@/services/sellerService';
import { getImagesLimit } from '@/services/adminService';
import type { ProductCategory } from '@/types/seller';
import type { BusinessProduct } from '@/types/business';
import { X } from 'lucide-react';

interface ProductFormProps {
  businessId: string;
  categoryId: string;
  onSuccess: () => void;
  onCancel: () => void;
  editProduct?: BusinessProduct;
}

export const ProductForm = ({ businessId, categoryId, onSuccess, onCancel, editProduct }: ProductFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [subcategories, setSubcategories] = useState<ProductCategory[]>([]);
  const [imagesLimit, setImagesLimit] = useState(4);
  const [formData, setFormData] = useState({
    name: editProduct?.name || '',
    description: editProduct?.description || '',
    price: editProduct?.price || '',
    original_price: editProduct?.original_price || '',
    category_id: editProduct?.category_id || '',
    commission_type: (editProduct?.commission_type || 'percentage') as 'percentage' | 'fixed',
    commission_rate: editProduct?.commission_rate || 10,
    fixed_commission: editProduct?.fixed_commission || '',
    min_commission: editProduct?.min_commission || '',
    affiliate_enabled: editProduct?.affiliate_enabled ?? true,
    is_available: editProduct?.is_available ?? true,
    is_featured: editProduct?.is_featured ?? false,
    image_urls: (editProduct?.image_url ? [editProduct.image_url] : []) as string[],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const subs = await fetchSubcategories(categoryId);
        setSubcategories(subs);
        const limit = await getImagesLimit();
        setImagesLimit(limit);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, [categoryId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = imagesLimit - formData.image_urls.length;
    if (remainingSlots <= 0) {
      toast({
        title: 'Image limit reached',
        description: `Maximum ${imagesLimit} images allowed`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i];
      const filePath = `products/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('gadgets')
        .upload(filePath, file);

      if (uploadError) {
        toast({
          title: 'Upload failed',
          description: uploadError.message,
          variant: 'destructive',
        });
        continue;
      }

      const { data } = supabase.storage.from('gadgets').getPublicUrl(filePath);
      if (data?.publicUrl) {
        uploadedUrls.push(data.publicUrl);
      }
    }

    setFormData(prev => ({
      ...prev,
      image_urls: [...prev.image_urls, ...uploadedUrls],
    }));
    setLoading(false);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category_id) {
      toast({
        title: 'Required fields missing',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const productData = {
        business_id: businessId,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price.toString()),
        original_price: formData.original_price ? parseFloat(formData.original_price.toString()) : null,
        category_id: formData.category_id,
        image_url: formData.image_urls[0] || null,
        commission_type: formData.commission_type,
        commission_rate: formData.commission_type === 'percentage' ? parseFloat(formData.commission_rate.toString()) : 0,
        fixed_commission: formData.commission_type === 'fixed' && formData.fixed_commission ? parseFloat(formData.fixed_commission.toString()) : null,
        min_commission: formData.min_commission ? parseFloat(formData.min_commission.toString()) : 0,
        affiliate_enabled: formData.affiliate_enabled,
        is_available: formData.is_available,
        is_featured: formData.is_featured,
      };

      if (editProduct) {
        const { error } = await supabase
          .from('business_products')
          .update(productData)
          .eq('id', editProduct.id);

        if (error) throw error;

        toast({
          title: 'Product updated',
          description: 'Your product has been updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('business_products')
          .insert(productData);

        if (error) throw error;

        toast({
          title: 'Product added',
          description: 'Your product has been added successfully',
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save product',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter product name"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your product"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price (UGX) *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="0"
            required
          />
        </div>
        <div>
          <Label htmlFor="original_price">Original Price (UGX)</Label>
          <Input
            id="original_price"
            type="number"
            value={formData.original_price}
            onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
            placeholder="Optional"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="category">Subcategory *</Label>
        <Select 
          value={formData.category_id} 
          onValueChange={(value) => setFormData({ ...formData, category_id: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select subcategory" />
          </SelectTrigger>
          <SelectContent>
            {subcategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 p-4 bg-muted rounded-lg">
        <h4 className="font-medium">Commission Settings</h4>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="affiliate_enabled">Enable Affiliate Promotion</Label>
          <Switch
            id="affiliate_enabled"
            checked={formData.affiliate_enabled}
            onCheckedChange={(checked) => setFormData({ ...formData, affiliate_enabled: checked })}
          />
        </div>

        {formData.affiliate_enabled && (
          <>
            <div>
              <Label>Commission Type</Label>
              <Select 
                value={formData.commission_type} 
                onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, commission_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount (UGX)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.commission_type === 'percentage' ? (
              <div>
                <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                <Input
                  id="commission_rate"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.commission_rate}
                  onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Affiliates will earn {formData.commission_rate}% commission on each sale
                </p>
              </div>
            ) : (
              <div>
                <Label htmlFor="fixed_commission">Fixed Commission (UGX)</Label>
                <Input
                  id="fixed_commission"
                  type="number"
                  value={formData.fixed_commission}
                  onChange={(e) => setFormData({ ...formData, fixed_commission: e.target.value })}
                  placeholder="Enter fixed amount"
                />
              </div>
            )}

            <div>
              <Label htmlFor="min_commission">Minimum Commission (UGX)</Label>
              <Input
                id="min_commission"
                type="number"
                value={formData.min_commission}
                onChange={(e) => setFormData({ ...formData, min_commission: e.target.value })}
                placeholder="Optional"
              />
            </div>
          </>
        )}
      </div>

      <div>
        <Label>Product Images ({formData.image_urls.length}/{imagesLimit})</Label>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          disabled={formData.image_urls.length >= imagesLimit || loading}
        />
        {formData.image_urls.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {formData.image_urls.map((url, index) => (
              <div key={index} className="relative">
                <img 
                  src={url} 
                  alt={`Product ${index + 1}`} 
                  className="w-full h-24 object-cover rounded border" 
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_available"
              checked={formData.is_available}
              onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
            />
            <Label htmlFor="is_available">In Stock</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
            />
            <Label htmlFor="is_featured">Featured</Label>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : editProduct ? 'Update Product' : 'Add Product'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
