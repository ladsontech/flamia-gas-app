-- Fix storage policies for proper image deletion
-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Admins can delete gadgets images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update gadgets images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete carousel images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update carousel images" ON storage.objects;

-- Recreate policies with proper permissions for admin operations
CREATE POLICY "Admins can update gadgets images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'gadgets' 
  AND (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE users.id = auth.uid() 
      AND users.email = 'admin@flamia.com'
    )
    OR auth.uid() IS NULL -- Allow service role operations
  )
);

CREATE POLICY "Admins can delete gadgets images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'gadgets' 
  AND (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE users.id = auth.uid() 
      AND users.email = 'admin@flamia.com'
    )
    OR auth.uid() IS NULL -- Allow service role operations
  )
);

CREATE POLICY "Admins can update carousel images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'carousel' 
  AND (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE users.id = auth.uid() 
      AND users.email = 'admin@flamia.com'
    )
    OR auth.uid() IS NULL -- Allow service role operations
  )
);

CREATE POLICY "Admins can delete carousel images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'carousel' 
  AND (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE users.id = auth.uid() 
      AND users.email = 'admin@flamia.com'
    )
    OR auth.uid() IS NULL -- Allow service role operations
  )
);

-- Add condition field to gadgets table
ALTER TABLE public.gadgets ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'brand_new' CHECK (condition IN ('brand_new', 'used'));