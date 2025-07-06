
-- Remove storage policies and make buckets open for all users
DROP POLICY IF EXISTS "Admins can upload gadgets images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update gadgets images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete gadgets images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload carousel images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update carousel images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete carousel images" ON storage.objects;

-- Create open policies for all users on both buckets
CREATE POLICY "Anyone can upload gadgets images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'gadgets');

CREATE POLICY "Anyone can update gadgets images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'gadgets');

CREATE POLICY "Anyone can delete gadgets images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'gadgets');

CREATE POLICY "Anyone can upload carousel images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'carousel');

CREATE POLICY "Anyone can update carousel images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'carousel');

CREATE POLICY "Anyone can delete carousel images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'carousel');

-- Create carousel_images table
CREATE TABLE public.carousel_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  order_position INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for carousel_images table
ALTER TABLE public.carousel_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Carousel images are viewable by everyone" 
ON public.carousel_images 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage carousel images" 
ON public.carousel_images 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email = 'admin@flamia.com'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email = 'admin@flamia.com'
  )
);

-- Remove unnecessary columns from gadgets table
ALTER TABLE public.gadgets DROP COLUMN IF EXISTS stock_quantity;
ALTER TABLE public.gadgets DROP COLUMN IF EXISTS rating;
ALTER TABLE public.gadgets DROP COLUMN IF EXISTS total_reviews;
ALTER TABLE public.gadgets DROP COLUMN IF EXISTS features;

-- Add trigger for updated_at on carousel_images
CREATE TRIGGER update_carousel_images_updated_at
  BEFORE UPDATE ON public.carousel_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
