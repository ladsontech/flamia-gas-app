
-- Update RLS policies to be more permissive since admin access is controlled via password
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can manage carousel images" ON public.carousel_images;
DROP POLICY IF EXISTS "Admins can insert gadgets" ON public.gadgets;
DROP POLICY IF EXISTS "Admins can update gadgets" ON public.gadgets;
DROP POLICY IF EXISTS "Admins can delete gadgets" ON public.gadgets;

-- Create open policies for carousel management
CREATE POLICY "Anyone can manage carousel images" 
ON public.carousel_images 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create open policies for gadgets management
CREATE POLICY "Anyone can insert gadgets" 
ON public.gadgets 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update gadgets" 
ON public.gadgets 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete gadgets" 
ON public.gadgets 
FOR DELETE 
USING (true);
