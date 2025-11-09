-- Assign categories to existing Flamia products based on their text category field

-- Update products with "Phones" or "phones" category
UPDATE public.business_products bp
SET category_id = pc.id
FROM public.product_categories pc
WHERE bp.business_id = '00000000-0000-0000-0000-000000000001'::uuid
AND bp.category_id IS NULL
AND pc.slug = 'phones'
AND (
  LOWER(bp.category) LIKE '%phone%'
  OR LOWER(bp.category) = 'electronics'
  OR LOWER(bp.name) LIKE '%phone%'
  OR LOWER(bp.name) LIKE '%iphone%'
  OR LOWER(bp.name) LIKE '%samsung%'
  OR LOWER(bp.name) LIKE '%tecno%'
  OR LOWER(bp.name) LIKE '%infinix%'
);

-- Update products with "Laptops" or "computers" category
UPDATE public.business_products bp
SET category_id = pc.id
FROM public.product_categories pc
WHERE bp.business_id = '00000000-0000-0000-0000-000000000001'::uuid
AND bp.category_id IS NULL
AND pc.slug = 'laptops-pcs'
AND (
  LOWER(bp.category) LIKE '%laptop%'
  OR LOWER(bp.category) LIKE '%computer%'
  OR LOWER(bp.category) LIKE '%pc%'
  OR LOWER(bp.name) LIKE '%laptop%'
  OR LOWER(bp.name) LIKE '%computer%'
  OR LOWER(bp.name) LIKE '%macbook%'
  OR LOWER(bp.name) LIKE '%dell%'
  OR LOWER(bp.name) LIKE '%hp%'
  OR LOWER(bp.name) LIKE '%lenovo%'
);

-- For any remaining Flamia products without category, assign to Electronics parent category
UPDATE public.business_products bp
SET category_id = pc.id
FROM public.product_categories pc
WHERE bp.business_id = '00000000-0000-0000-0000-000000000001'::uuid
AND bp.category_id IS NULL
AND pc.slug = 'electronics'
AND pc.parent_id IS NULL;

-- Ensure all Flamia products are marked as available
UPDATE public.business_products
SET is_available = true
WHERE business_id = '00000000-0000-0000-0000-000000000001'::uuid
AND is_available IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_business_products_category_id ON public.business_products(category_id);
CREATE INDEX IF NOT EXISTS idx_business_products_business_id ON public.business_products(business_id);

