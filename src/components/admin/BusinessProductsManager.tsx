
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import { Business, BusinessProduct } from '@/types/business';
import { 
  fetchBusinesses, 
  fetchBusinessProducts, 
  createBusinessProduct, 
  updateBusinessProduct, 
  deleteBusinessProduct 
} from '@/services/businessService';
import ImageUpload from './ImageUpload';

const BusinessProductsManager: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [products, setProducts] = useState<BusinessProduct[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<BusinessProduct | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    business_id: '',
    name: '',
    description: '',
    price: 0,
    original_price: 0,
    category: '',
    is_available: true,
    is_featured: false,
    image_url: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadBusinesses();
  }, []);

  useEffect(() => {
    if (selectedBusinessId) {
      loadProducts();
    }
  }, [selectedBusinessId]);

  const loadBusinesses = async () => {
    try {
      const data = await fetchBusinesses();
      setBusinesses(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load businesses",
        variant: "destructive"
      });
    }
  };

  const loadProducts = async () => {
    if (!selectedBusinessId) return;
    
    setLoading(true);
    try {
      const data = await fetchBusinessProducts(selectedBusinessId);
      setProducts(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusinessId) {
      toast({
        title: "Error",
        description: "Please select a business first",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const productData = {
      ...formData,
      business_id: selectedBusinessId,
      original_price: formData.original_price || undefined
    };

    try {
      if (editingProduct) {
        await updateBusinessProduct(editingProduct.id, productData);
        toast({
          title: "Success",
          description: "Product updated successfully"
        });
      } else {
        await createBusinessProduct(productData);
        toast({
          title: "Success",
          description: "Product created successfully"
        });
      }
      
      resetForm();
      loadProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: BusinessProduct) => {
    setEditingProduct(product);
    setFormData({
      business_id: product.business_id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      original_price: product.original_price || 0,
      category: product.category || '',
      is_available: product.is_available,
      is_featured: product.is_featured,
      image_url: product.image_url || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteBusinessProduct(id);
      toast({
        title: "Success",
        description: "Product deleted successfully"
      });
      loadProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      business_id: '',
      name: '',
      description: '',
      price: 0,
      original_price: 0,
      category: '',
      is_available: true,
      is_featured: false,
      image_url: ''
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Business Products</h2>
        <Button 
          onClick={() => setShowForm(true)}
          disabled={!selectedBusinessId}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Label htmlFor="business-select">Select Business:</Label>
            <Select value={selectedBusinessId} onValueChange={setSelectedBusinessId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Choose a business" />
              </SelectTrigger>
              <SelectContent>
                {businesses.map((business) => (
                  <SelectItem key={business.id} value={business.id}>
                    {business.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g., Pizza, Cakes, Drinks"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (UGX)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice">Original Price (Optional)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => setFormData({...formData, original_price: parseFloat(e.target.value)})}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageUpload
                  bucket="gadgets"
                  onUploadComplete={(url) => setFormData({...formData, image_url: url})}
                  currentImage={formData.image_url}
                  title="Product Image"
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})}
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="available"
                    checked={formData.is_available}
                    onCheckedChange={(checked) => setFormData({...formData, is_available: checked})}
                  />
                  <Label htmlFor="available">Available</Label>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {selectedBusinessId && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4" />
                    <h3 className="font-semibold">{product.name}</h3>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                {product.image_url && (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}
                
                <p className="text-sm font-bold text-orange-600 mb-1">
                  UGX {product.price.toLocaleString()}
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-xs text-gray-500 line-through ml-2">
                      UGX {product.original_price.toLocaleString()}
                    </span>
                  )}
                </p>
                
                {product.category && (
                  <p className="text-xs text-gray-600 mb-1">{product.category}</p>
                )}
                
                {product.description && (
                  <p className="text-xs text-gray-500 mb-2">{product.description}</p>
                )}
                
                <div className="flex space-x-2">
                  {product.is_featured && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Featured
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded ${
                    product.is_available 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.is_available ? 'Available' : 'Unavailable'}
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

export default BusinessProductsManager;
