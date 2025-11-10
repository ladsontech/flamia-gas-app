import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Gadget } from '@/types/gadget';
import ImageUpload from './ImageUpload';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Expanded, ecommerce-style categories for Flamia products
const categories = [
  // Phones & Tablets
  'Phones',
  'Tablets',
  // Computers
  'Laptops & PCs',
  'Monitors',
  'Printers & Scanners',
  // TV & Audio
  'TVs',
  'Audio',
  'Home Theater',
  // Wearables & Cameras
  'Wearables',
  'Cameras',
  'Drones',
  // Gaming
  'Gaming Consoles',
  'Gaming Accessories',
  // Accessories
  'Phone Accessories',
  'Computer Accessories',
  'Storage & Memory',
  'Network & Routers',
  // Fashion
  'Fashion - Men',
  'Fashion - Women',
  'Fashion - Kids',
  'Fashion - Shoes',
  'Fashion - Bags & Accessories',
  // Beauty & Health
  'Beauty & Personal Care',
  'Health & Wellness',
  // Home & Living
  'Home & Kitchen',
  'Furniture & Decor',
  // Power & Lighting
  'Power & Lighting',
  // Appliances
  'Small Appliances',
  'Kitchen Appliances'
];

const brands = ['Apple', 'Samsung', 'Tecno', 'Infinix', 'Itel', 'Nokia', 'Xiaomi', 'OPPO', 'Vivo', 'Huawei', 'Realme', 'Google', 'Sony', 'LG', 'Hisense', 'TCL', 'HP', 'Dell', 'Lenovo', 'Acer', 'Asus', 'Microsoft'];

// Categories that behave like "gadgets" where Brand and Condition apply
const gadgetCategorySet = new Set<string>([
  'Phones',
  'Tablets',
  'Laptops & PCs',
  'Monitors',
  'Printers & Scanners',
  'TVs',
  'Audio',
  'Home Theater',
  'Wearables',
  'Cameras',
  'Drones',
  'Gaming Consoles',
  'Gaming Accessories',
  'Phone Accessories',
  'Computer Accessories',
  'Storage & Memory',
  'Network & Routers',
  'Power & Lighting',
]);
const isGadgetCategory = (category?: string) => !!category && gadgetCategorySet.has(category);

const GadgetsManager: React.FC = () => {
  const [gadgets, setGadgets] = useState<Gadget[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingGadget, setEditingGadget] = useState<Gadget | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    category: '',
    brand: '',
    image_url: '',
    condition: 'brand_new' as 'brand_new' | 'used',
    in_stock: true,
    featured: false
  });

  useEffect(() => {
    fetchGadgets();
  }, []);

  const fetchGadgets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('flamia_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGadgets((data || []).map(gadget => ({
        ...gadget,
        name: gadget.name || 'Unnamed Product',
        description: gadget.description || '',
        price: typeof gadget.price === 'number' ? gadget.price : Number(gadget.price) || 0,
        original_price: gadget.original_price ?? null,
        category: gadget.category || '',
        brand: gadget.brand || '',
        image_url: gadget.image_url || '',
        condition: (gadget.condition as 'brand_new' | 'used') || 'brand_new',
        in_stock: Boolean(gadget.in_stock),
        featured: Boolean(gadget.featured)
      })));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch gadgets",
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
      category: '',
      brand: '',
      image_url: '',
      condition: 'brand_new' as 'brand_new' | 'used',
      in_stock: true,
      featured: false
    });
    setEditingGadget(null);
  };

  const handleEdit = (gadget: Gadget) => {
    setEditingGadget(gadget);
    setFormData({
      name: gadget.name,
      description: gadget.description,
      price: gadget.price.toString(),
      original_price: gadget.original_price?.toString() || '',
      category: gadget.category,
      brand: gadget.brand || '',
      image_url: gadget.image_url || '',
      condition: gadget.condition,
      in_stock: gadget.in_stock,
      featured: gadget.featured || false
    });
    setIsDialogOpen(true);
  };

  const handleToggleFeatured = async (gadget: Gadget) => {
    try {
      const { error } = await supabase
        .from('flamia_products')
        .update({ featured: !(gadget.featured || false) })
        .eq('id', gadget.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Gadget ${!(gadget.featured || false) ? 'featured' : 'unfeatured'} successfully!`
      });

      fetchGadgets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update featured status",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      const gadgetLike = isGadgetCategory(formData.category);
      if (!formData.name || !formData.price || !formData.category || (gadgetLike && !formData.condition)) {
        toast({
          title: "Missing required fields",
          description: gadgetLike ? "Name, Price, Category and Condition are required." : "Name, Price and Category are required.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const parsedPrice = parseFloat(formData.price);
      const parsedOriginal = formData.original_price ? parseFloat(formData.original_price) : null;
      if (Number.isNaN(parsedPrice) || (formData.original_price && Number.isNaN(parsedOriginal as number))) {
        toast({
          title: "Invalid price",
          description: "Please enter valid numeric values for price fields.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const gadgetData = {
        name: formData.name,
        description: formData.description || '',
        price: parsedPrice,
        original_price: parsedOriginal,
        category: formData.category,
        brand: gadgetLike ? (!formData.brand || formData.brand === 'other' ? null : formData.brand) : null,
        image_url: formData.image_url || null,
        condition: gadgetLike ? formData.condition : null,
        in_stock: formData.in_stock,
        featured: formData.featured
      };

      let productId = editingGadget?.id;

      if (editingGadget) {
        const { error } = await supabase
          .from('flamia_products')
          .update(gadgetData)
          .eq('id', editingGadget.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('flamia_products')
          .insert([gadgetData])
          .select('id')
          .single();
        if (error) throw error;
        productId = data?.id;
      }

      // Upload gallery images to storage/products/<productId>/...
      if (productId && pendingFiles.length > 0) {
        const uploadedUrls: string[] = [];
        for (const file of pendingFiles.slice(0, 4)) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
          const filePath = `products/${productId}/${fileName}`;
          const { error: uploadError } = await supabase.storage
            .from('gadgets')
            .upload(filePath, file);
          if (!uploadError) {
            const { data } = supabase.storage.from('gadgets').getPublicUrl(filePath);
            if (data?.publicUrl) uploadedUrls.push(data.publicUrl);
          }
        }
        // Ensure primary image set
        if (uploadedUrls.length > 0) {
          const { error: updateError } = await supabase
            .from('flamia_products')
            .update({ image_url: gadgetData.image_url || uploadedUrls[0] })
            .eq('id', productId);
          if (updateError) {
            console.warn('Failed to set primary image_url', updateError);
          }
        }
      }

      toast({
        title: "Success",
        description: editingGadget ? "Product updated successfully!" : "Product created successfully!"
      });

      setIsDialogOpen(false);
      resetForm();
      setPendingFiles([]);
      setPendingPreviews([]);
      fetchGadgets();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to save gadget',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gadget?')) return;

    try {
      const { error } = await supabase
        .from('flamia_products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Gadget deleted successfully!"
      });

      fetchGadgets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete gadget",
        variant: "destructive"
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Filter and group by category
  const normalizedQuery = searchTerm.trim().toLowerCase();
  const filtered = gadgets.filter(g => {
    if (!normalizedQuery) return true;
    const hay = `${g.name} ${g.brand || ''} ${g.category || ''}`.toLowerCase();
    return hay.includes(normalizedQuery);
  });
  const grouped: Record<string, Gadget[]> = filtered.reduce((acc, g) => {
    const key = g.category || 'Uncategorized';
    if (!acc[key]) acc[key] = [];
    acc[key].push(g);
    return acc;
  }, {} as Record<string, Gadget[]>);
  const groupKeys = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg md:text-2xl font-bold">Flamia Products Management</h2>
        <div className="flex w-full sm:w-auto items-center gap-2">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, brand, category..."
            className="h-9 text-sm bg-white w-full sm:w-72"
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-accent hover:bg-accent/90 h-9">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-full sm:max-w-5xl max-h-[90vh] overflow-y-auto mx-2">
            <DialogHeader>
              <DialogTitle>
                {editingGadget ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      placeholder="e.g., iPhone 13 Pro Max 256GB"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      required
                      placeholder="Key features, condition details, warranty, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price (UGX) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="1"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        required
                        placeholder="e.g., 1500000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="original_price">Original Price (UGX)</Label>
                      <Input
                        id="original_price"
                        type="number"
                        step="1"
                        value={formData.original_price}
                        onChange={(e) => setFormData({...formData, original_price: e.target.value})}
                        placeholder="e.g., 2000000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg rounded-md">
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {isGadgetCategory(formData.category) && (
                      <div>
                        <Label htmlFor="brand">Brand</Label>
                        <Select value={formData.brand} onValueChange={(value) => setFormData({...formData, brand: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg rounded-md">
                            {brands.map((brand) => (
                              <SelectItem key={brand} value={brand}>
                                {brand}
                              </SelectItem>
                            ))}
                            <SelectItem value="other">Other / Not Listed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {isGadgetCategory(formData.category) && (
                    <div>
                      <Label htmlFor="condition">Condition *</Label>
                      <Select value={formData.condition} onValueChange={(value: 'brand_new' | 'used') => setFormData({...formData, condition: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg rounded-md">
                          <SelectItem value="brand_new">Brand New</SelectItem>
                          <SelectItem value="used">UK Used</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({...formData, featured: checked})}
                    />
                    <Label htmlFor="featured">Featured Product</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Product Images (Max 4)</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const available = 4 - pendingFiles.length;
                      const selected = files.slice(0, available);
                      setPendingFiles(prev => [...prev, ...selected]);
                      selected.forEach(file => {
                        const reader = new FileReader();
                        reader.onload = (ev) => setPendingPreviews(prev => [...prev, String(ev.target?.result || '')]);
                        reader.readAsDataURL(file);
                      });
                    }}
                    disabled={pendingFiles.length >= 4}
                  />
                  {pendingPreviews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                      {pendingPreviews.map((src, idx) => (
                        <div key={idx} className="relative">
                          <img src={src} alt={`Preview ${idx + 1}`} className="w-full aspect-square object-cover rounded" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => {
                              setPendingPreviews(prev => prev.filter((_, i) => i !== idx));
                              setPendingFiles(prev => prev.filter((_, i) => i !== idx));
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Recommended: Square images, at least 800x800 for best quality. The first uploaded image becomes the main image.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-accent hover:bg-accent/90 w-full sm:w-auto">
                  {loading ? 'Saving...' : editingGadget ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {groupKeys.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-500">No products match your search.</div>
      )}

      {groupKeys.map((key) => (
        <div key={key} className="space-y-2 md:space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm md:text-base font-semibold text-gray-900">
              {key} <span className="text-xs text-gray-500">({grouped[key].length})</span>
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 w-full overflow-x-hidden">
            {grouped[key].map((gadget) => (
          <Card key={gadget.id} className="overflow-hidden w-full">
            <CardHeader className="p-3 md:p-4">
              {gadget.image_url && (
                <img
                  src={gadget.image_url}
                  alt={gadget.name}
                  className="w-full aspect-square object-cover rounded-lg mb-3"
                />
              )}
              <CardTitle className="text-base md:text-lg line-clamp-2 break-words">{gadget.name}</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={gadget.in_stock ? "default" : "secondary"}>
                  {gadget.in_stock ? 'In Stock' : 'Out of Stock'}
                </Badge>
                <Badge variant="outline">{gadget.category}</Badge>
                {isGadgetCategory(gadget.category) && gadget.condition && (
                  <Badge 
                    className={`text-xs ${
                      gadget.condition === 'brand_new' 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-yellow-500 text-white'
                    }`}
                  >
                    {gadget.condition === 'brand_new' ? 'Brand New' : 'UK Used'}
                  </Badge>
                )}
                {gadget.featured && (
                  <Badge className="bg-orange-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <p className="text-xs md:text-sm text-gray-600 line-clamp-2 break-words mb-2">{gadget.description}</p>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-bold text-sm md:text-lg text-accent">
                    {formatPrice(gadget.price)}
                  </span>
                  {gadget.original_price && (
                    <span className="text-xs md:text-sm text-gray-500 line-through ml-2 block sm:inline">
                      {formatPrice(gadget.original_price)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-xs md:text-sm text-gray-500">{gadget.brand}</span>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant={gadget.featured ? "default" : "outline"} 
                    onClick={() => handleToggleFeatured(gadget)}
                  >
                    <Star className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(gadget)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(gadget.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
            ))}
          </div>
        </div>
      ))}

      {gadgets.length === 0 && !loading && (
        <div className="text-center py-8 md:py-12">
          <p className="text-gray-500">No products found. Add your first product to get started!</p>
        </div>
      )}
    </div>
  );
};

export default GadgetsManager;
