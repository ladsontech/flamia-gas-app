-- Seed major specialization categories and their subcategories
-- Parents: Electronics, Fashion

-- Upsert parent categories
insert into public.product_categories (name, slug, is_active, display_order)
values 
  ('Electronics', 'electronics', true, 10),
  ('Fashion', 'fashion', true, 20)
on conflict (slug) do update set
  name = excluded.name,
  is_active = excluded.is_active,
  display_order = excluded.display_order;

-- Electronics subcategories
with parent as (
  select id from public.product_categories where slug = 'electronics' limit 1
)
insert into public.product_categories (name, slug, is_active, display_order, parent_id)
select name, slug, true, display_order, (select id from parent)
from (values
  ('Phones', 'phones', 1),
  ('Laptops & PCs', 'laptops-pcs', 2),
  ('TVs', 'tvs', 3),
  ('Wearables', 'wearables', 4),
  ('Monitors', 'monitors', 5),
  ('Network & Routers', 'network-and-routers', 6)
) as v(name, slug, display_order)
on conflict (slug) do update set
  name = excluded.name,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  parent_id = excluded.parent_id;

-- Fashion subcategories
with parent as (
  select id from public.product_categories where slug = 'fashion' limit 1
)
insert into public.product_categories (name, slug, is_active, display_order, parent_id)
select name, slug, true, display_order, (select id from parent)
from (values
  ('Men''s Fashion', 'mens-fashion', 1),
  ('Women''s Fashion', 'womens-fashion', 2),
  ('Shoes', 'shoes', 3),
  ('Bags', 'bags', 4)
) as v(name, slug, display_order)
on conflict (slug) do update set
  name = excluded.name,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  parent_id = excluded.parent_id;


