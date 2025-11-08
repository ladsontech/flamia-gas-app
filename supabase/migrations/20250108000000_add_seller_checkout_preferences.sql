-- Add checkout preferences for seller shops
ALTER TABLE public.seller_shops
ADD COLUMN IF NOT EXISTS checkout_type TEXT DEFAULT 'flamia' CHECK (checkout_type IN ('flamia', 'whatsapp', 'both')),
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Add comments
COMMENT ON COLUMN public.seller_shops.checkout_type IS 'Checkout method: flamia (Flamia checkout), whatsapp (WhatsApp only - no account needed), both (customer choice)';
COMMENT ON COLUMN public.seller_shops.whatsapp_number IS 'WhatsApp number for direct checkout (format: +256XXXXXXXXX). WhatsApp orders are guest orders by default.';

