import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Star, X } from 'lucide-react';
import type { ProductCategory } from '@/types/seller';

const FLAMIA_BUSINESS_ID = '00000000-0000-0000-0000-000000000001';

interface FlamiaProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category_id: string | null;
  image_url: string | null;
  commission_type: 'percentage' | 'fixed';
  commission_rate: number;
  fixed_commission: number | null;
  min_commission: number;
  affiliate_enabled: boolean;
  is_available: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

const FlamiaProductsManager: React.FC = () => {
  const [products, setProducts] = useState<FlamiaProduct[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FlamiaProduct | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    category_id: '',
    image_urls: [] as string[],
    commission_type: 'percentage' as 'percentage' | 'fixed',
    commission_rate: 10,
    fixed_commission: '',
    min_commission: '',
    affiliate_enabled: true,
    is_available: true,
    is_featured: false
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('business_products')
        .select('*')
        .eq('business_id', FLAMIA_BUSINESS_ID)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      original_price: '',
      category_id: '',
      image_urls: [],
      commission_type: 'percentage',
      commission_rate: 10,
      fixed_commission: '',
      min_commission: '',
      affiliate_enabled: true,
      is_available: true,
      is_featured: false
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: FlamiaProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      category_id: product.category_id || '',
      image_urls: product.image_url ? [product.image_url] : [],
      commission_type: product.commission_type,
      commission_rate: product.commission_rate,
      fixed_commission: product.fixed_commission?.toString() || '',
      min_commission: product.min_commission?.toString() || '',
      affiliate_enabled: product.affiliate_enabled,
      is_available: product.is_available,
      is_featured: product.is_featured
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 4 - formData.image_urls.length;
    if (remainingSlots <= 0) {
      toast({
        title: 'Image limit reached',
        description: 'Maximum 4 images allowed',
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
        .from('shop-products')
        .upload(filePath, file);

      if (uploadError) {
        toast({
          title: 'Upload failed',
          description: uploadError.message,
          variant: 'destructive',
        });
        continue;
      }

      const { data } = supabase.storage.from('shop-products').getPublicUrl(filePath);
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('business_products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully"
      });
      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
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
        business_id: FLAMIA_BUSINESS_ID,
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        category_id: formData.category_id,
        image_url: formData.image_urls[0] || null,
        commission_type: formData.commission_type,
        commission_rate: formData.commission_type === 'percentage' ? parseFloat(formData.commission_rate.toString()) : 0,
        fixed_commission: formData.commission_type === 'fixed' && formData.fixed_commission ? parseFloat(formData.fixed_commission) : null,
        min_commission: formData.min_commission ? parseFloat(formData.min_commission) : 0,
        affiliate_enabled: formData.affiliate_enabled,
        is_available: formData.is_available,
        is_featured: formData.is_featured
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('business_products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Product updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('business_products')
          .insert([productData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Product created successfully"
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Flamia Products</h3>
          <p className="text-sm text-muted-foreground">Manage products owned by Flamia</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category_id">Category *</Label>
                    <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="price">Price (UGX) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="original_price">Original Price (UGX)</Label>
                    <Input
                      id="original_price"
                      type="number"
                      value={formData.original_price}
                      onChange={(e) => setFormData({...formData, original_price: e.target.value})}
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
                  />
                </div>

                {/* Commission Settings */}
                <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                  <h4 className="font-medium text-sm">Affiliate Commission Settings</h4>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="affiliate_enabled"
                      checked={formData.affiliate_enabled}
                      onCheckedChange={(checked) => setFormData({...formData, affiliate_enabled: checked})}
                    />
                    <Label htmlFor="affiliate_enabled">Enable Affiliate Marketing</Label>
                  </div>

                  {formData.affiliate_enabled && (
                    <>
                      <div>
                        <Label>Commission Type</Label>
                        <Select value={formData.commission_type} onValueChange={(value: 'percentage' | 'fixed') => setFormData({...formData, commission_type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.commission_type === 'percentage' ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                            <Input
                              id="commission_rate"
                              type="number"
                              value={formData.commission_rate}
                              onChange={(e) => setFormData({...formData, commission_rate: parseFloat(e.target.value)})}
                              min="0"
                              max="100"
                            />
                          </div>
                          <div>
                            <Label htmlFor="min_commission">Minimum Commission (UGX)</Label>
                            <Input
                              id="min_commission"
                              type="number"
                              value={formData.min_commission}
                              onChange={(e) => setFormData({...formData, min_commission: e.target.value})}
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Label htmlFor="fixed_commission">Fixed Commission (UGX)</Label>
                          <Input
                            id="fixed_commission"
                            type="number"
                            value={formData.fixed_commission}
                            onChange={(e) => setFormData({...formData, fixed_commission: e.target.value})}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Product Images (Max 4)</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={formData.image_urls.length >= 4}
                  />
                  {formData.image_urls.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {formData.image_urls.map((url, index) => (
                        <div key={index} className="relative">
                          <img src={url} alt={`Product ${index + 1}`} className="w-full h-20 object-cover rounded" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-0 right-0 h-6 w-6"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_available"
                      checked={formData.is_available}
                      onCheckedChange={(checked) => setFormData({...formData, is_available: checked})}
                    />
                    <Label htmlFor="is_available">Available</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})}
                    />
                    <Label htmlFor="is_featured">Featured</Label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-accent hover:bg-accent/90 w-full sm:w-auto">
                  {loading ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <CardContent className="p-4">
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-md mb-3"
                />
              )}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold line-clamp-2">{product.name}</h4>
                  {product.is_featured && (
                    <Badge variant="secondary" className="ml-2">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold">UGX {product.price.toLocaleString()}</span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      UGX {product.original_price.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={product.is_available ? "default" : "secondary"}>
                    {product.is_available ? 'Available' : 'Out of Stock'}
                  </Badge>
                  {product.affiliate_enabled && (
                    <Badge variant="outline">Affiliate Enabled</Badge>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No products yet. Click "Add Product" to create your first product.</p>
        </div>
      )}
    </div>
  );
};

export default FlamiaProductsManager;
