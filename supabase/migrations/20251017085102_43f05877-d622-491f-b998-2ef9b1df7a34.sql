-- Add manual_delivery_person field for orders completed by non-system delivery persons
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS manual_delivery_person TEXT;

-- Ensure cancellation_reason field exists
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.orders.manual_delivery_person IS 'Name of delivery person who is not in the system';
COMMENT ON COLUMN public.orders.cancellation_reason IS 'Reason for order cancellation';