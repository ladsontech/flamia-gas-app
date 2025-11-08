-- Add seller shop tracking and checkout method to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS seller_shop_id UUID REFERENCES public.seller_shops(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS affiliate_shop_id UUID REFERENCES public.affiliate_shops(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS checkout_method TEXT DEFAULT 'flamia' CHECK (checkout_method IN ('flamia', 'whatsapp', 'manual'));

-- Add comments
COMMENT ON COLUMN public.orders.seller_shop_id IS 'Reference to seller shop if order was placed through a seller storefront';
COMMENT ON COLUMN public.orders.affiliate_shop_id IS 'Reference to affiliate shop if order was placed through an affiliate storefront';
COMMENT ON COLUMN public.orders.checkout_method IS 'How the order was placed: flamia (Flamia checkout), whatsapp (WhatsApp order), manual (admin created)';

-- Create seller_orders table to track seller-specific order details and commissions
CREATE TABLE IF NOT EXISTS public.seller_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_shop_id UUID NOT NULL REFERENCES public.seller_shops(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  business_product_id UUID NOT NULL REFERENCES public.business_products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  seller_commission NUMERIC DEFAULT 0,
  flamia_commission NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  whatsapp_order_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(order_id, business_product_id)
);

-- Add comments
COMMENT ON TABLE public.seller_orders IS 'Tracks all orders from seller shops including WhatsApp orders for analytics and commission calculation';
COMMENT ON COLUMN public.seller_orders.whatsapp_order_data IS 'JSON data for WhatsApp orders: {customer_name, phone, message, timestamp}';
COMMENT ON COLUMN public.seller_orders.seller_commission IS 'Commission earned by seller (if Flamia handles payment)';
COMMENT ON COLUMN public.seller_orders.flamia_commission IS 'Commission earned by Flamia (if Flamia handles payment)';

-- Enable RLS
ALTER TABLE public.seller_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for seller_orders
CREATE POLICY "Sellers can view their own orders"
ON public.seller_orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.seller_shops
    WHERE seller_shops.id = seller_orders.seller_shop_id
    AND seller_shops.user_id = auth.uid()
  )
);

CREATE POLICY "Super admins can manage all seller orders"
ON public.seller_orders FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can create seller orders"
ON public.seller_orders FOR INSERT
WITH CHECK (true);

CREATE POLICY "Sellers can update their own orders"
ON public.seller_orders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.seller_shops
    WHERE seller_shops.id = seller_orders.seller_shop_id
    AND seller_shops.user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_seller_orders_shop_id ON public.seller_orders(seller_shop_id);
CREATE INDEX IF NOT EXISTS idx_seller_orders_order_id ON public.seller_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_seller_orders_status ON public.seller_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_seller_shop_id ON public.orders(seller_shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_affiliate_shop_id ON public.orders(affiliate_shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_checkout_method ON public.orders(checkout_method);

-- Create trigger for updated_at
CREATE TRIGGER update_seller_orders_updated_at
BEFORE UPDATE ON public.seller_orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

