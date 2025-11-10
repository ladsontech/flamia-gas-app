-- Create seller_orders table
CREATE TABLE IF NOT EXISTS public.seller_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_shop_id UUID NOT NULL REFERENCES public.seller_shops(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  business_product_id UUID NOT NULL REFERENCES public.business_products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  seller_commission NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seller_orders ENABLE ROW LEVEL SECURITY;

-- Policies for seller_orders
CREATE POLICY "Sellers can view their own orders"
  ON public.seller_orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.seller_shops
      WHERE seller_shops.id = seller_orders.seller_shop_id
      AND seller_shops.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage all seller orders"
  ON public.seller_orders
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can create seller orders"
  ON public.seller_orders
  FOR INSERT
  WITH CHECK (true);

-- Add checkout_type to seller_shops
ALTER TABLE public.seller_shops
ADD COLUMN IF NOT EXISTS checkout_type TEXT DEFAULT 'whatsapp';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_seller_orders_shop_id ON public.seller_orders(seller_shop_id);
CREATE INDEX IF NOT EXISTS idx_seller_orders_order_id ON public.seller_orders(order_id);