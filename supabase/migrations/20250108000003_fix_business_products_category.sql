-- Add category_id column to business_products if it doesn't exist
ALTER TABLE public.business_products
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.product_categories(id);

-- Add commission fields if they don't exist
ALTER TABLE public.business_products
ADD COLUMN IF NOT EXISTS commission_type TEXT DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed')),
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC DEFAULT 10,
ADD COLUMN IF NOT EXISTS fixed_commission NUMERIC,
ADD COLUMN IF NOT EXISTS min_commission NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS affiliate_enabled BOOLEAN DEFAULT true;

-- Migrate category text to category_id where possible
UPDATE public.business_products bp
SET category_id = pc.id
FROM public.product_categories pc
WHERE bp.category_id IS NULL
AND (
  LOWER(bp.category) = LOWER(pc.name) 
  OR LOWER(bp.category) = LOWER(REPLACE(pc.slug, '-', ' '))
);

-- Add comment
COMMENT ON COLUMN public.business_products.category_id IS 'References product_categories table. Use this instead of category text field.';
COMMENT ON COLUMN public.business_products.category IS 'Legacy text category field. Use category_id instead.';

