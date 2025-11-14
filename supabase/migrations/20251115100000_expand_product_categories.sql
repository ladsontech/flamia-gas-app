-- Expand product categories with more major categories and comprehensive subcategories
-- This migration adds: Fashion, Electronics, Home & Kitchen, Beauty & Health, Sports & Outdoors, Books & Media

-- First, let's add the new major categories
INSERT INTO public.product_categories (name, slug, parent_id, is_active, display_order)
VALUES 
  ('Beauty & Health', 'beauty-health', NULL, true, 4),
  ('Sports & Outdoors', 'sports-outdoors', NULL, true, 5),
  ('Books & Media', 'books-media', NULL, true, 6)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order;

-- Fashion subcategories (expanded)
WITH parent AS (
  SELECT id FROM public.product_categories WHERE slug = 'fashion' LIMIT 1
)
INSERT INTO public.product_categories (name, slug, parent_id, is_active, display_order)
SELECT name, slug, (SELECT id FROM parent), true, display_order
FROM (VALUES
  ('Men''s Fashion', 'mens-fashion', 1),
  ('Women''s Fashion', 'womens-fashion', 2),
  ('Kids Fashion', 'kids-fashion', 3),
  ('Men''s Shoes', 'mens-shoes', 4),
  ('Women''s Shoes', 'womens-shoes', 5),
  ('Kids Shoes', 'kids-shoes', 6),
  ('Bags & Luggage', 'bags-luggage', 7),
  ('Watches', 'watches', 8),
  ('Jewelry & Accessories', 'jewelry-accessories', 9),
  ('Sunglasses & Eyewear', 'sunglasses-eyewear', 10),
  ('Perfumes & Fragrances', 'perfumes-fragrances', 11)
) AS v(name, slug, display_order)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order,
  parent_id = EXCLUDED.parent_id;

-- Electronics subcategories (expanded)
WITH parent AS (
  SELECT id FROM public.product_categories WHERE slug = 'electronics' LIMIT 1
)
INSERT INTO public.product_categories (name, slug, parent_id, is_active, display_order)
SELECT name, slug, (SELECT id FROM parent), true, display_order
FROM (VALUES
  ('Phones & Tablets', 'phones-tablets', 1),
  ('Laptops & Computers', 'laptops-computers', 2),
  ('TVs & Home Theater', 'tvs-home-theater', 3),
  ('Audio & Speakers', 'audio-speakers', 4),
  ('Cameras & Photography', 'cameras-photography', 5),
  ('Gaming Consoles & Accessories', 'gaming-consoles', 6),
  ('Wearables & Smartwatches', 'wearables-smartwatches', 7),
  ('Headphones & Earbuds', 'headphones-earbuds', 8),
  ('Computer Accessories', 'computer-accessories', 9),
  ('Phone Accessories', 'phone-accessories', 10),
  ('Power Banks & Chargers', 'power-banks-chargers', 11)
) AS v(name, slug, display_order)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order,
  parent_id = EXCLUDED.parent_id;

-- Home & Kitchen subcategories (expanded)
WITH parent AS (
  SELECT id FROM public.product_categories WHERE slug = 'home-kitchen' LIMIT 1
)
INSERT INTO public.product_categories (name, slug, parent_id, is_active, display_order)
SELECT name, slug, (SELECT id FROM parent), true, display_order
FROM (VALUES
  ('Kitchen Appliances', 'kitchen-appliances', 1),
  ('Cookware & Bakeware', 'cookware-bakeware', 2),
  ('Home Decor', 'home-decor', 3),
  ('Bedding & Linens', 'bedding-linens', 4),
  ('Furniture', 'furniture', 5),
  ('Storage & Organization', 'storage-organization', 6),
  ('Lighting', 'lighting', 7),
  ('Cleaning Supplies', 'cleaning-supplies', 8)
) AS v(name, slug, display_order)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order,
  parent_id = EXCLUDED.parent_id;

-- Beauty & Health subcategories
WITH parent AS (
  SELECT id FROM public.product_categories WHERE slug = 'beauty-health' LIMIT 1
)
INSERT INTO public.product_categories (name, slug, parent_id, is_active, display_order)
SELECT name, slug, (SELECT id FROM parent), true, display_order
FROM (VALUES
  ('Skincare', 'skincare', 1),
  ('Makeup & Cosmetics', 'makeup-cosmetics', 2),
  ('Hair Care', 'hair-care', 3),
  ('Fragrances', 'fragrances', 4),
  ('Personal Care', 'personal-care', 5),
  ('Health & Wellness', 'health-wellness', 6),
  ('Vitamins & Supplements', 'vitamins-supplements', 7),
  ('Medical Supplies', 'medical-supplies', 8)
) AS v(name, slug, display_order)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order,
  parent_id = EXCLUDED.parent_id;

-- Sports & Outdoors subcategories
WITH parent AS (
  SELECT id FROM public.product_categories WHERE slug = 'sports-outdoors' LIMIT 1
)
INSERT INTO public.product_categories (name, slug, parent_id, is_active, display_order)
SELECT name, slug, (SELECT id FROM parent), true, display_order
FROM (VALUES
  ('Sports Equipment', 'sports-equipment', 1),
  ('Fitness & Gym', 'fitness-gym', 2),
  ('Outdoor Recreation', 'outdoor-recreation', 3),
  ('Camping & Hiking', 'camping-hiking', 4),
  ('Sportswear', 'sportswear', 5),
  ('Sports Shoes', 'sports-shoes', 6),
  ('Cycling', 'cycling', 7)
) AS v(name, slug, display_order)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order,
  parent_id = EXCLUDED.parent_id;

-- Books & Media subcategories
WITH parent AS (
  SELECT id FROM public.product_categories WHERE slug = 'books-media' LIMIT 1
)
INSERT INTO public.product_categories (name, slug, parent_id, is_active, display_order)
SELECT name, slug, (SELECT id FROM parent), true, display_order
FROM (VALUES
  ('Books', 'books', 1),
  ('Magazines', 'magazines', 2),
  ('Music & Instruments', 'music-instruments', 3),
  ('Movies & TV Shows', 'movies-tv', 4),
  ('Video Games', 'video-games', 5),
  ('Educational Materials', 'educational-materials', 6)
) AS v(name, slug, display_order)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order,
  parent_id = EXCLUDED.parent_id;

