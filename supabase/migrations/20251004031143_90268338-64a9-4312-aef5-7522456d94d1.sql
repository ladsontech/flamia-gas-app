-- Add total_amount field to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS total_amount numeric;

-- Add comment to explain the field
COMMENT ON COLUMN public.orders.total_amount IS 'Total amount/price for the order in UGX';