import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Gadget } from '@/types/gadget';
import ImageUpload from './ImageUpload';
import { Plus, Edit, Trash2, Star } from 'lucide-react';

const categories = ['Smartphones', 'Laptops', 'Tablets', 'Audio', 'Wearables', 'Gaming'];
const brands = ['Apple', 'Samsung', 'Google', 'Dell', 'Sony', 'Microsoft', 'HP', 'Lenovo'];

const GadgetsManager: React.FC = () => {
  const [gadgets, setGadgets] = useState<Gadget[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingGadget, setEditingGadget] = useState<Gadget | null>(null);
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
    features: '',
    stock_quantity: '',
    rating: '',
    total_reviews: '',
    in_stock: true
  });

  useEffect(() => {
    fetchGadgets();
  }, []);

  const fetchGadgets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gadgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGadgets(data || []);
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
      features: '',
      stock_quantity: '',
      rating: '',
      total_reviews: '',
      in_stock: true
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
      features: gadget.features?.join(', ') || '',
      stock_quantity: gadget.stock_quantity.toString(),
      rating: gadget.rating.toString(),
      total_reviews: gadget.total_reviews.toString(),
      in_stock: gadget.in_stock
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      const featuresArray = formData.features
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const gadgetData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        category: formData.category,
        brand: formData.brand || null,
        image_url: formData.image_url || null,
        features: featuresArray,
        stock_quantity: parseInt(formData.stock_quantity),
        rating: parseFloat(formData.rating),
        total_reviews: parseInt(formData.total_reviews),
        in_stock: formData.in_stock
      };

      if (editingGadget) {
        const { error } = await supabase
          .from('gadgets')
          .update(gadgetData)
          .eq('id', editingGadget.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Gadget updated successfully!"
        });
      } else {
        const { error } = await supabase
          .from('gadgets')
          .insert([gadgetData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Gadget created successfully!"
        });
      }

      setIsDialogOpen(false);
      resetForm();
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
        .from('gadgets')
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gadgets Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-accent hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Gadget
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingGadget ? 'Edit Gadget' : 'Add New Gadget'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
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
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price ($) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="original_price">Original Price ($)</Label>
                      <Input
                        id="original_price"
                        type="number"
                        step="0.01"
                        value={formData.original_price}
                        onChange={(e) => setFormData({...formData, original_price: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="brand">Brand</Label>
                      <Select value={formData.brand} onValueChange={(value) => setFormData({...formData, brand: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand} value={brand}>
                              {brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="features">Features (comma-separated)</Label>
                    <Textarea
                      id="features"
                      value={formData.features}
                      onChange={(e) => setFormData({...formData, features: e.target.value})}
                      placeholder="6.7-inch display, A17 Pro chip, 128GB storage"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="stock_quantity">Stock *</Label>
                      <Input
                        id="stock_quantity"
                        type="number"
                        min="0"
                        value={formData.stock_quantity}
                        onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="rating">Rating (1-5) *</Label>
                      <Input
                        id="rating"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={formData.rating}
                        onChange={(e) => setFormData({...formData, rating: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="total_reviews">Reviews *</Label>
                      <Input
                        id="total_reviews"
                        type="number"
                        min="0"
                        value={formData.total_reviews}
                        onChange={(e) => setFormData({...formData, total_reviews: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <ImageUpload
                    bucket="gadgets"
                    title="Product Image"
                    currentImage={formData.image_url}
                    onUploadComplete={(url) => setFormData({...formData, image_url: url})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-accent hover:bg-accent/90">
                  {loading ? 'Saving...' : editingGadget ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gadgets.map((gadget) => (
          <Card key={gadget.id} className="overflow-hidden">
            <CardHeader className="p-4">
              {gadget.image_url && (
                <img
                  src={gadget.image_url}
                  alt={gadget.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}
              <CardTitle className="text-lg line-clamp-2">{gadget.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={gadget.in_stock ? "default" : "secondary"}>
                  {gadget.in_stock ? 'In Stock' : 'Out of Stock'}
                </Badge>
                <Badge variant="outline">{gadget.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{gadget.description}</p>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-bold text-lg">${gadget.price}</span>
                  {gadget.original_price && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      ${gadget.original_price}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{gadget.rating}</span>
                  <span className="text-xs text-gray-500">({gadget.total_reviews})</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Stock: {gadget.stock_quantity}</span>
                <div className="flex gap-2">
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

      {gadgets.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No gadgets found. Add your first gadget to get started!</p>
        </div>
      )}
    </div>
  );
};

export default GadgetsManager;