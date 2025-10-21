-- Create storage buckets for seller and affiliate shops
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('shop-logos', 'shop-logos', true),
  ('shop-products', 'shop-products', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for shop-logos bucket
CREATE POLICY "Shop logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'shop-logos');

CREATE POLICY "Authenticated users can upload shop logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'shop-logos' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their shop logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'shop-logos' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their shop logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'shop-logos' 
  AND auth.uid() IS NOT NULL
);

-- Storage policies for shop-products bucket
CREATE POLICY "Shop products are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'shop-products');

CREATE POLICY "Authenticated users can upload shop products"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'shop-products' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their shop products"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'shop-products' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their shop products"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'shop-products' 
  AND auth.uid() IS NOT NULL
);