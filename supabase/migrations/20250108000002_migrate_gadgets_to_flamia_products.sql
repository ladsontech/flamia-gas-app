-- Create a Flamia business entry if it doesn't exist
INSERT INTO public.businesses (id, name, email, phone, address, is_active, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Flamia',
  'products@flamia.store',
  '+256700000000',
  'Kampala, Uganda',
  true,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  is_active = EXCLUDED.is_active;

-- Migrate existing gadgets to business_products as Flamia-owned products
INSERT INTO public.business_products (
  business_id,
  name,
  description,
  price,
  original_price,
  category,
  image_url,
  is_available,
  is_featured,
  created_at,
  updated_at
)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid as business_id,
  name,
  description,
  price,
  original_price,
  category,
  image_url,
  in_stock as is_available,
  COALESCE(featured, false) as is_featured,
  created_at,
  updated_at
FROM public.gadgets
WHERE NOT EXISTS (
  SELECT 1 FROM public.business_products bp 
  WHERE bp.name = gadgets.name 
  AND bp.business_id = '00000000-0000-0000-0000-000000000001'::uuid
);

-- Add comment
COMMENT ON TABLE public.business_products IS 'Products from businesses and Flamia. Flamia products have business_id = 00000000-0000-0000-0000-000000000001';

