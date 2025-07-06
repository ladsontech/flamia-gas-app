import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from './ImageUpload';
import { Plus, Edit, Trash2, Eye, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CarouselImage {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link_url?: string;
  order: number;
}

const CarouselManager: React.FC = () => {
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([
    {
      id: '1',
      title: 'Latest Smartphones',
      description: 'Discover the newest smartphone technology',
      image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop',
      order: 1
    },
    {
      id: '2',
      title: 'Premium Laptops',
      description: 'High-performance laptops for work and gaming',
      image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop',
      order: 2
    },
    {
      id: '3',
      title: 'Gaming Accessories',
      description: 'Enhance your gaming experience',
      image_url: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&h=600&fit=crop',
      order: 3
    }
  ]);
  
  const [editingImage, setEditingImage] = useState<CarouselImage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    order: '1'
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      order: '1'
    });
    setEditingImage(null);
  };

  const handleEdit = (image: CarouselImage) => {
    setEditingImage(image);
    setFormData({
      title: image.title,
      description: image.description,
      image_url: image.image_url,
      link_url: image.link_url || '',
      order: image.order.toString()
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const imageData: CarouselImage = {
      id: editingImage?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      image_url: formData.image_url,
      link_url: formData.link_url || undefined,
      order: parseInt(formData.order)
    };

    if (editingImage) {
      setCarouselImages(prev => 
        prev.map(img => img.id === editingImage.id ? imageData : img)
      );
      toast({
        title: "Success",
        description: "Carousel image updated successfully!"
      });
    } else {
      setCarouselImages(prev => [...prev, imageData]);
      toast({
        title: "Success",
        description: "Carousel image added successfully!"
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this carousel image?')) return;

    setCarouselImages(prev => prev.filter(img => img.id !== id));
    toast({
      title: "Success",
      description: "Carousel image deleted successfully!"
    });
  };

  const moveImage = (id: string, direction: 'up' | 'down') => {
    setCarouselImages(prev => {
      const sortedImages = [...prev].sort((a, b) => a.order - b.order);
      const currentIndex = sortedImages.findIndex(img => img.id === id);
      
      if (currentIndex === -1) return prev;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= sortedImages.length) return prev;

      // Swap orders
      const currentOrder = sortedImages[currentIndex].order;
      const targetOrder = sortedImages[newIndex].order;
      
      return prev.map(img => {
        if (img.id === id) return { ...img, order: targetOrder };
        if (img.id === sortedImages[newIndex].id) return { ...img, order: currentOrder };
        return img;
      });
    });
  };

  const sortedImages = [...carouselImages].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Carousel Management</h2>
          <p className="text-gray-600 text-sm mt-1">Manage images that appear on the Gadgets page carousel</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-accent hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Carousel Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingImage ? 'Edit Carousel Image' : 'Add New Carousel Image'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                      placeholder="e.g., Latest Smartphones"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required
                      placeholder="e.g., Discover the newest technology"
                    />
                  </div>

                  <div>
                    <Label htmlFor="link_url">Link URL (optional)</Label>
                    <Input
                      id="link_url"
                      type="url"
                      value={formData.link_url}
                      onChange={(e) => setFormData({...formData, link_url: e.target.value})}
                      placeholder="/gadgets or https://example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="order">Display Order *</Label>
                    <Input
                      id="order"
                      type="number"
                      min="1"
                      value={formData.order}
                      onChange={(e) => setFormData({...formData, order: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <ImageUpload
                    bucket="carousel"
                    title="Carousel Image"
                    currentImage={formData.image_url}
                    onUploadComplete={(url) => setFormData({...formData, image_url: url})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-accent hover:bg-accent/90">
                  {editingImage ? 'Update' : 'Add'} Image
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          These carousel images will appear at the top of the Gadgets page. They auto-slide every 4 seconds and visitors can navigate through them manually.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedImages.map((image, index) => (
          <Card key={image.id} className="overflow-hidden">
            <CardHeader className="p-4">
              <img
                src={image.image_url}
                alt={image.title}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              <CardTitle className="text-lg">{image.title}</CardTitle>
              <p className="text-sm text-gray-600">{image.description}</p>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500">Order: {image.order}</span>
                {image.link_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(image.link_url, '_blank')}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => moveImage(image.id, 'up')}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => moveImage(image.id, 'down')}
                    disabled={index === sortedImages.length - 1}
                  >
                    ↓
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(image)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(image.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {carouselImages.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">No carousel images found. Add your first image to get started!</p>
          <p className="text-sm text-gray-400 mt-2">These images will appear on the Gadgets page carousel.</p>
        </div>
      )}
    </div>
  );
};

export default CarouselManager;
