
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ImageUpload from './ImageUpload';
import { Plus, Edit, Trash2, Eye, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CarouselImage {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link_url?: string;
  order_position: number;
  is_active: boolean;
}

const CarouselManager: React.FC = () => {
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingImage, setEditingImage] = useState<CarouselImage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    order_position: '1'
  });

  useEffect(() => {
    fetchCarouselImages();
  }, []);

  const fetchCarouselImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('carousel_images')
        .select('*')
        .order('order_position', { ascending: true });

      if (error) throw error;
      setCarouselImages(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch carousel images",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      order_position: '1'
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
      order_position: image.order_position.toString()
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      const imageData = {
        title: formData.title,
        description: formData.description,
        image_url: formData.image_url,
        link_url: formData.link_url || null,
        order_position: parseInt(formData.order_position)
      };

      if (editingImage) {
        const { error } = await supabase
          .from('carousel_images')
          .update(imageData)
          .eq('id', editingImage.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Carousel image updated successfully!"
        });
      } else {
        const { error } = await supabase
          .from('carousel_images')
          .insert([imageData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Carousel image added successfully!"
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCarouselImages();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to save carousel image',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this carousel image?')) return;

    try {
      const { error } = await supabase
        .from('carousel_images')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Carousel image deleted successfully!"
      });

      fetchCarouselImages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete carousel image",
        variant: "destructive"
      });
    }
  };

  const moveImage = async (id: string, direction: 'up' | 'down') => {
    const sortedImages = [...carouselImages].sort((a, b) => a.order_position - b.order_position);
    const currentIndex = sortedImages.findIndex(img => img.id === id);
    
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sortedImages.length) return;

    // Swap order positions
    const currentOrder = sortedImages[currentIndex].order_position;
    const targetOrder = sortedImages[newIndex].order_position;
    
    try {
      await supabase
        .from('carousel_images')
        .update({ order_position: targetOrder })
        .eq('id', id);

      await supabase
        .from('carousel_images')
        .update({ order_position: currentOrder })
        .eq('id', sortedImages[newIndex].id);

      fetchCarouselImages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reorder images",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Carousel Management</h2>
          <p className="text-gray-600 text-sm mt-1">Manage images that appear on the Gadgets page carousel</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-accent hover:bg-accent/90 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Carousel Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-2">
            <DialogHeader>
              <DialogTitle>
                {editingImage ? 'Edit Carousel Image' : 'Add New Carousel Image'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
                      value={formData.order_position}
                      onChange={(e) => setFormData({...formData, order_position: e.target.value})}
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

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" className="bg-accent hover:bg-accent/90 w-full sm:w-auto" disabled={loading}>
                  {loading ? 'Saving...' : editingImage ? 'Update' : 'Add'} Image
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {carouselImages.map((image, index) => (
          <Card key={image.id} className="overflow-hidden">
            <CardHeader className="p-3 md:p-4">
              <img
                src={image.image_url}
                alt={image.title}
                className="w-full aspect-square object-cover rounded-lg mb-3"
              />
              <CardTitle className="text-base md:text-lg">{image.title}</CardTitle>
              <p className="text-sm text-gray-600">{image.description}</p>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500">Order: {image.order_position}</span>
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
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
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
                    disabled={index === carouselImages.length - 1}
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

      {carouselImages.length === 0 && !loading && (
        <div className="text-center py-8 md:py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">No carousel images found. Add your first image to get started!</p>
          <p className="text-sm text-gray-400 mt-2">These images will appear on the Gadgets page carousel.</p>
        </div>
      )}
    </div>
  );
};

export default CarouselManager;
