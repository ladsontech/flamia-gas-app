-- Create affiliate shops table
CREATE TABLE public.affiliate_shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shop_name TEXT NOT NULL,
  shop_slug TEXT NOT NULL UNIQUE,
  shop_description TEXT,
  shop_logo_url TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
  custom_domain TEXT UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  monthly_fee NUMERIC NOT NULL DEFAULT 0,
  last_payment_date TIMESTAMPTZ,
  next_payment_due TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create affiliate shop products table (links affiliates to seller products)
CREATE TABLE public.affiliate_shop_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_shop_id UUID NOT NULL REFERENCES public.affiliate_shops(id) ON DELETE CASCADE,
  business_product_id UUID NOT NULL REFERENCES public.business_products(id) ON DELETE CASCADE,
  commission_rate NUMERIC DEFAULT 0,
  commission_type TEXT DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed')),
  fixed_commission NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(affiliate_shop_id, business_product_id)
);

-- Create affiliate orders table to track commissions
CREATE TABLE public.affiliate_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_shop_id UUID NOT NULL REFERENCES public.affiliate_shops(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  business_product_id UUID NOT NULL REFERENCES public.business_products(id) ON DELETE CASCADE,
  commission_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  UNIQUE(order_id, business_product_id)
);

-- Enable RLS
ALTER TABLE public.affiliate_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliate_shops
CREATE POLICY "Affiliates can create their own shop"
ON public.affiliate_shops FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Affiliates can view their own shop"
ON public.affiliate_shops FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Affiliates can update their own shop"
ON public.affiliate_shops FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Public can view active affiliate shops"
ON public.affiliate_shops FOR SELECT
USING (is_active = true);

CREATE POLICY "Super admins can manage all affiliate shops"
ON public.affiliate_shops FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for affiliate_shop_products
CREATE POLICY "Affiliates can manage their shop products"
ON public.affiliate_shop_products FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.affiliate_shops
    WHERE affiliate_shops.id = affiliate_shop_products.affiliate_shop_id
    AND affiliate_shops.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.affiliate_shops
    WHERE affiliate_shops.id = affiliate_shop_products.affiliate_shop_id
    AND affiliate_shops.user_id = auth.uid()
  )
);

CREATE POLICY "Public can view active affiliate products"
ON public.affiliate_shop_products FOR SELECT
USING (is_active = true);

-- RLS Policies for affiliate_orders
CREATE POLICY "Affiliates can view their own orders"
ON public.affiliate_orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.affiliate_shops
    WHERE affiliate_shops.id = affiliate_orders.affiliate_shop_id
    AND affiliate_shops.user_id = auth.uid()
  )
);

CREATE POLICY "Super admins can manage all affiliate orders"
ON public.affiliate_orders FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can create affiliate orders"
ON public.affiliate_orders FOR INSERT
WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_affiliate_shops_updated_at
BEFORE UPDATE ON public.affiliate_shops
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_affiliate_shops_user_id ON public.affiliate_shops(user_id);
CREATE INDEX idx_affiliate_shops_slug ON public.affiliate_shops(shop_slug);
CREATE INDEX idx_affiliate_shop_products_shop_id ON public.affiliate_shop_products(affiliate_shop_id);
CREATE INDEX idx_affiliate_orders_shop_id ON public.affiliate_orders(affiliate_shop_id);
CREATE INDEX idx_affiliate_orders_order_id ON public.affiliate_orders(order_id);