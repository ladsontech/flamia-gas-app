-- Create product_views table to track product views
CREATE TABLE IF NOT EXISTS public.product_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('gadget', 'business_product')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON public.product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_user_id ON public.product_views(user_id);
CREATE INDEX IF NOT EXISTS idx_product_views_viewed_at ON public.product_views(viewed_at);

-- Enable RLS
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view product view counts
CREATE POLICY "Product views are viewable by everyone"
ON public.product_views FOR SELECT
USING (true);

-- Anyone can insert product views (tracking)
CREATE POLICY "Anyone can track product views"
ON public.product_views FOR INSERT
WITH CHECK (true);

-- Only admins can delete product views
CREATE POLICY "Admins can delete product views"
ON public.product_views FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email = 'admin@flamia.com'
  )
);

