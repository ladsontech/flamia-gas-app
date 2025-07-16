
-- Add category column to carousel_images table to distinguish between gas and gadgets
ALTER TABLE public.carousel_images ADD COLUMN category text NOT NULL DEFAULT 'gas';

-- Update existing carousel images to be categorized as 'gas' (for home page)
UPDATE public.carousel_images SET category = 'gas';

-- Add check constraint to ensure category is either 'gas' or 'gadgets'
ALTER TABLE public.carousel_images ADD CONSTRAINT carousel_images_category_check 
CHECK (category IN ('gas', 'gadgets'));
