-- Add unique constraints to support ON CONFLICT in functions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.commissions'::regclass 
      AND conname = 'commissions_order_id_unique'
  ) THEN
    ALTER TABLE public.commissions
    ADD CONSTRAINT commissions_order_id_unique UNIQUE (order_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.referrals'::regclass 
      AND conname = 'referrals_referrer_referred_unique'
  ) THEN
    ALTER TABLE public.referrals
    ADD CONSTRAINT referrals_referrer_referred_unique UNIQUE (referrer_id, referred_user_id);
  END IF;
END $$;

-- Create triggers to automatically create and approve commissions
DROP TRIGGER IF EXISTS trg_orders_after_insert_handle_order_creation ON public.orders;
DROP TRIGGER IF EXISTS trg_orders_after_update_handle_order_completion ON public.orders;

CREATE TRIGGER trg_orders_after_insert_handle_order_creation
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_order_creation();

CREATE TRIGGER trg_orders_after_update_handle_order_completion
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.handle_order_completion();