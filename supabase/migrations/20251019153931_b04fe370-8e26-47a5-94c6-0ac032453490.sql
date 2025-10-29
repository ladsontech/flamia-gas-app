-- Create seller_applications table first
CREATE TABLE public.seller_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  category_id UUID,
  sample_product_name TEXT,
  description TEXT,
  sample_images TEXT[],
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  review_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.seller_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create their own applications"
ON public.seller_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own applications"
ON public.seller_applications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
ON public.seller_applications FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can update all applications"
ON public.seller_applications FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_seller_applications_updated_at
BEFORE UPDATE ON public.seller_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create product categories table
CREATE TABLE public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES public.product_categories(id) ON DELETE CASCADE,
  icon TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_categories
CREATE POLICY "Product categories are viewable by everyone"
ON public.product_categories FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage product categories"
ON public.product_categories FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Insert predefined categories
INSERT INTO public.product_categories (name, slug, parent_id, display_order) VALUES
  ('Electronics', 'electronics', NULL, 1),
  ('Fashion', 'fashion', NULL, 2),
  ('Home & Kitchen', 'home-kitchen', NULL, 3);

-- Get parent category IDs and insert subcategories
DO $$
DECLARE
  electronics_id UUID;
  fashion_id UUID;
BEGIN
  SELECT id INTO electronics_id FROM public.product_categories WHERE slug = 'electronics';
  SELECT id INTO fashion_id FROM public.product_categories WHERE slug = 'fashion';

  -- Electronics subcategories
  INSERT INTO public.product_categories (name, slug, parent_id, display_order) VALUES
    ('Phones', 'phones', electronics_id, 1),
    ('Laptops & PCs', 'laptops-pcs', electronics_id, 2),
    ('TVs', 'tvs', electronics_id, 3),
    ('Audio & Speakers', 'audio-speakers', electronics_id, 4);

  -- Fashion subcategories
  INSERT INTO public.product_categories (name, slug, parent_id, display_order) VALUES
    ('Men''s Clothing', 'mens-clothing', fashion_id, 1),
    ('Women''s Clothing', 'womens-clothing', fashion_id, 2),
    ('Kids Clothing', 'kids-clothing', fashion_id, 3),
    ('Shoes', 'shoes', fashion_id, 4),
    ('Bags', 'bags', fashion_id, 5);
END $$;

-- Now add foreign key to seller_applications after product_categories exists
ALTER TABLE public.seller_applications
ADD CONSTRAINT fk_seller_applications_category
FOREIGN KEY (category_id) REFERENCES public.product_categories(id);

-- Create seller_shops table
CREATE TABLE public.seller_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.seller_applications(id),
  shop_name TEXT NOT NULL,
  shop_slug TEXT UNIQUE NOT NULL,
  category_id UUID NOT NULL REFERENCES public.product_categories(id),
  tier TEXT DEFAULT 'basic' NOT NULL CHECK (tier IN ('basic', 'premium')),
  custom_domain TEXT,
  commission_enabled BOOLEAN DEFAULT true NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_approved BOOLEAN DEFAULT false NOT NULL,
  monthly_fee NUMERIC DEFAULT 50000 NOT NULL,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  next_payment_due TIMESTAMP WITH TIME ZONE,
  shop_description TEXT,
  shop_logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.seller_shops ENABLE ROW LEVEL SECURITY;

-- RLS Policies for seller_shops
CREATE POLICY "Sellers can view their own shop"
ON public.seller_shops FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Sellers can update their own shop"
ON public.seller_shops FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all seller shops"
ON public.seller_shops FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Public can view active and approved shops"
ON public.seller_shops FOR SELECT
USING (is_active = true AND is_approved = true);

-- Create seller_payments table
CREATE TABLE public.seller_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_shop_id UUID NOT NULL REFERENCES public.seller_shops(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_method TEXT,
  payment_reference TEXT,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'paid', 'failed')),
  payment_date TIMESTAMP WITH TIME ZONE,
  billing_period_start DATE,
  billing_period_end DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.seller_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for seller_payments
CREATE POLICY "Sellers can view their own payments"
ON public.seller_payments FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.seller_shops
  WHERE seller_shops.id = seller_payments.seller_shop_id
  AND seller_shops.user_id = auth.uid()
));

CREATE POLICY "Super admins can manage all seller payments"
ON public.seller_payments FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Update business_products table with commission fields
ALTER TABLE public.business_products
ADD COLUMN commission_rate NUMERIC DEFAULT 0,
ADD COLUMN commission_type TEXT DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed')),
ADD COLUMN fixed_commission NUMERIC,
ADD COLUMN min_commission NUMERIC DEFAULT 0,
ADD COLUMN affiliate_enabled BOOLEAN DEFAULT true,
ADD COLUMN category_id UUID REFERENCES public.product_categories(id);

-- Update businesses table
ALTER TABLE public.businesses
ADD COLUMN category_id UUID REFERENCES public.product_categories(id),
ADD COLUMN owner_type TEXT DEFAULT 'flamia' CHECK (owner_type IN ('flamia', 'seller')),
ADD COLUMN shop_id UUID REFERENCES public.seller_shops(id);

-- Create indexes for better performance
CREATE INDEX idx_seller_applications_user_id ON public.seller_applications(user_id);
CREATE INDEX idx_seller_applications_status ON public.seller_applications(status);
CREATE INDEX idx_seller_shops_slug ON public.seller_shops(shop_slug);
CREATE INDEX idx_seller_shops_user_id ON public.seller_shops(user_id);
CREATE INDEX idx_seller_shops_category ON public.seller_shops(category_id);
CREATE INDEX idx_business_products_category ON public.business_products(category_id);
CREATE INDEX idx_businesses_category ON public.businesses(category_id);
CREATE INDEX idx_product_categories_parent ON public.product_categories(parent_id);
CREATE INDEX idx_product_categories_slug ON public.product_categories(slug);

-- Triggers for updated_at
CREATE TRIGGER update_product_categories_updated_at
BEFORE UPDATE ON public.product_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seller_shops_updated_at
BEFORE UPDATE ON public.seller_shops
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seller_payments_updated_at
BEFORE UPDATE ON public.seller_payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();