-- Add affiliate control fields to seller shops and products

-- Add allow_affiliates to seller_shops (store-level control)
ALTER TABLE public.seller_shops
ADD COLUMN IF NOT EXISTS allow_affiliates BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.seller_shops.allow_affiliates IS 'Whether this store allows affiliates to resell their products';

-- Add price_model to business_products (product-level commission control)
ALTER TABLE public.business_products
ADD COLUMN IF NOT EXISTS price_model TEXT DEFAULT 'flexible' CHECK (price_model IN ('fixed', 'flexible'));

COMMENT ON COLUMN public.business_products.price_model IS 'Commission model: fixed (merchant sets commission, price locked) or flexible (affiliate sets own price and commission)';

-- Update existing products to have flexible model by default
UPDATE public.business_products
SET price_model = 'flexible'
WHERE price_model IS NULL;

-- Add preferred_price_model to affiliate_shops (affiliate's preference)
ALTER TABLE public.affiliate_shops
ADD COLUMN IF NOT EXISTS preferred_price_model TEXT DEFAULT 'both' CHECK (preferred_price_model IN ('fixed', 'flexible', 'both'));

COMMENT ON COLUMN public.affiliate_shops.preferred_price_model IS 'Affiliate preference: fixed (only fixed-price products), flexible (only flexible-price products), or both (all products)';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_business_products_price_model ON public.business_products(price_model);
CREATE INDEX IF NOT EXISTS idx_seller_shops_allow_affiliates ON public.seller_shops(allow_affiliates);
CREATE INDEX IF NOT EXISTS idx_affiliate_shops_preferred_price_model ON public.affiliate_shops(preferred_price_model);

