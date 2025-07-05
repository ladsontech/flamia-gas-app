-- Create storage buckets for gadgets and carousel images
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('gadgets', 'gadgets', true),
  ('carousel', 'carousel', true);

-- Create storage policies for gadgets bucket
CREATE POLICY "Gadgets images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'gadgets');

CREATE POLICY "Admins can upload gadgets images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'gadgets' 
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email = 'admin@flamia.com'
  )
);

CREATE POLICY "Admins can update gadgets images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'gadgets' 
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email = 'admin@flamia.com'
  )
);

CREATE POLICY "Admins can delete gadgets images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'gadgets' 
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email = 'admin@flamia.com'
  )
);

-- Create storage policies for carousel bucket
CREATE POLICY "Carousel images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'carousel');

CREATE POLICY "Admins can upload carousel images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'carousel' 
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email = 'admin@flamia.com'
  )
);

CREATE POLICY "Admins can update carousel images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'carousel' 
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email = 'admin@flamia.com'
  )
);

CREATE POLICY "Admins can delete carousel images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'carousel' 
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email = 'admin@flamia.com'
  )
);