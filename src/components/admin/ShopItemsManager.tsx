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

const categories = ['Electronics', 'Phones', 'Computers', 'Audio', 'Accessories', 'Home', 'Other'];

const ShopItemsManager: React.FC = () => {
  const [items, setItems] = useState<Gadget[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<Gadget | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

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
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gadgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems((data || []).map(item => ({
        ...item,
        condition: item.condition as 'brand_new' | 'used',
        featured: item.featured || false
      })));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch shop items",
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
    setEditingItem(null);
  };

  const handleEdit = (item: Gadget) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      original_price: item.original_price?.toString() || '',
      category: item.category,
      brand: item.brand || '',
      image_url: item.image_url || '',
      condition: item.condition,
      in_stock: item.in_stock,
      featured: item.featured || false
    });
    setIsDialogOpen(true);
  };

  const handleToggleFeatured = async (item: Gadget) => {
    try {
      const { error } = await supabase
        .from('gadgets')
        .update({ featured: !item.featured })
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Item ${!item.featured ? 'featured' : 'unfeatured'} successfully`
      });
      fetchItems();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const itemData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        category: formData.category,
        brand: formData.brand || null,
        image_url: formData.image_url || null,
        condition: formData.condition,
        in_stock: formData.in_stock,
        featured: formData.featured
      };

      if (editingItem) {
        const { error } = await supabase
          .from('gadgets')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Item updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('gadgets')
          .insert([itemData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Item added successfully"
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchItems();
    } catch (error) {
      toast({
        title: "Error",
        description: editingItem ? "Failed to update item" : "Failed to add item",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from('gadgets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Item deleted successfully"
      });
      fetchItems();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive"
      });
    }
  };

  const formatPrice = (price: number) => {
    return `UGX ${price.toLocaleString()}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Shop Items</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Item name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Item description"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
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

                <div className="space-y-2">
                  <Label htmlFor="original_price">Original Price (UGX)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Brand name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value: 'brand_new' | 'used') => setFormData({ ...formData, condition: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brand_new">Brand New</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Image</Label>
                <ImageUpload
                  bucket="gadgets"
                  onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                  currentImage={formData.image_url}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="in_stock"
                    checked={formData.in_stock}
                    onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
                  />
                  <Label htmlFor="in_stock">In Stock</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading && !items.length ? (
        <div className="text-center py-8">Loading...</div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            No items found. Add your first item to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="pb-2 p-2 md:p-4 md:pb-3">
                <div className="flex justify-between items-start gap-1">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xs md:text-base truncate line-clamp-1">{item.name}</CardTitle>
                    <div className="hidden md:flex gap-2 mt-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      {item.brand && <Badge variant="secondary" className="text-xs">{item.brand}</Badge>}
                      <Badge variant={item.condition === 'brand_new' ? 'default' : 'secondary'} className="text-xs">
                        {item.condition === 'brand_new' ? 'New' : 'Used'}
                      </Badge>
                      {!item.in_stock && <Badge variant="destructive" className="text-xs">Out of Stock</Badge>}
                    </div>
                  </div>
                  {item.featured && <Star className="h-3 w-3 md:h-4 md:w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 p-2 md:p-4 md:space-y-3">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-20 md:h-40 object-cover rounded-md"
                  />
                )}
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-1 md:line-clamp-2 hidden md:block">{item.description}</p>
                <div className="flex items-baseline gap-1 md:gap-2">
                  <span className="text-xs md:text-lg font-bold truncate">{formatPrice(item.price)}</span>
                  {item.original_price && item.original_price > item.price && (
                    <span className="text-xs md:text-sm text-muted-foreground line-through hidden md:inline">
                      {formatPrice(item.original_price)}
                    </span>
                  )}
                </div>
                <div className="flex gap-1 md:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="flex-1 h-7 md:h-9 text-xs md:text-sm px-1 md:px-3"
                  >
                    <Edit className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
                    <span className="hidden md:inline">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleFeatured(item)}
                    className="h-7 md:h-9 px-1 md:px-3"
                  >
                    <Star className={`h-3 w-3 md:h-4 md:w-4 ${item.featured ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="h-7 md:h-9 px-1 md:px-3"
                  >
                    <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopItemsManager;
