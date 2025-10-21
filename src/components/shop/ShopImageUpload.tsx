import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, X, Loader2 } from 'lucide-react';

interface ShopImageUploadProps {
  bucket: 'shop-logos' | 'shop-products';
  onUploadComplete: (url: string) => void;
  currentImage?: string;
  title?: string;
  aspectRatio?: 'square' | 'video' | 'auto';
}

export const ShopImageUpload = ({ 
  bucket, 
  onUploadComplete, 
  currentImage, 
  title = "Upload Image",
  aspectRatio = 'square'
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = fileName;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      toast.success('Image uploaded successfully!');
      onUploadComplete(publicUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onUploadComplete('');
  };

  const aspectClass = aspectRatio === 'square' ? 'aspect-square' : aspectRatio === 'video' ? 'aspect-video' : '';

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">{title}</Label>
      
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className={`w-full ${aspectClass} object-cover rounded-lg border-2 border-border`}
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={removeImage}
            type="button"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className={`border-2 border-dashed border-muted-foreground/25 rounded-lg ${aspectClass} flex flex-col items-center justify-center text-center p-6 bg-muted/20`}>
          <Upload className="w-10 h-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Click below to select an image</p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
        </div>
      )}

      <Input
        type="file"
        accept="image/*"
        onChange={uploadImage}
        disabled={uploading}
        className="cursor-pointer"
      />

      {uploading && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Uploading...</span>
        </div>
      )}
    </div>
  );
};