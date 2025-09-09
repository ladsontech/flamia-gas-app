-- Roles, Seller Applications, Marketplace Settings, and Ownership Links

-- 1) User roles table (super admin, seller)
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('super_admin','seller')),
  created_at timestamptz not null default now()
);

-- 2) Seller applications table
create table if not exists public.seller_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  shop_name text not null,
  category text,
  description text,
  sample_product_name text,
  sample_images jsonb default '[]'::jsonb,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  review_notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 3) Marketplace settings (singleton row pattern)
create table if not exists public.marketplace_settings (
  id int primary key default 1,
  images_per_product int not null default 4,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure exactly one row exists
insert into public.marketplace_settings (id) values (1)
on conflict (id) do nothing;

-- 4) Ownership links
-- Add owner_user_id to businesses if not exists
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'businesses' and column_name = 'owner_user_id'
  ) then
    alter table public.businesses add column owner_user_id uuid references auth.users(id) on delete set null;
  end if;
end $$;

-- Add seller_user_id to business_products if not exists
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'business_products' and column_name = 'seller_user_id'
  ) then
    alter table public.business_products add column seller_user_id uuid references auth.users(id) on delete set null;
  end if;
end $$;

-- 5) Trigger to update updated_at on marketplace_settings
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_marketplace_settings_updated_at on public.marketplace_settings;
create trigger trg_marketplace_settings_updated_at
before update on public.marketplace_settings
for each row execute procedure public.set_updated_at();

