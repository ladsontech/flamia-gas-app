-- Add unique index to prevent duplicate commissions per order
CREATE UNIQUE INDEX IF NOT EXISTS uniq_commissions_order_id
ON public.commissions(order_id);

-- Create function to insert pending commission on order creation
CREATE OR REPLACE FUNCTION public.handle_order_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  commission_amount numeric;
BEGIN
  IF NEW.referral_id IS NOT NULL THEN
    commission_amount := calculate_commission(NEW.description);
    IF commission_amount > 0 THEN
      INSERT INTO public.commissions (referral_id, order_id, amount, status)
      VALUES (NEW.referral_id, NEW.id, commission_amount, 'pending')
      ON CONFLICT (order_id) DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Update completion handler to upsert commission to approved
CREATE OR REPLACE FUNCTION public.handle_order_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  commission_amount numeric;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status <> 'completed') THEN
    IF NEW.referral_id IS NOT NULL THEN
      commission_amount := calculate_commission(NEW.description);
      IF commission_amount > 0 THEN
        INSERT INTO public.commissions (referral_id, order_id, amount, status, approved_at)
        VALUES (NEW.referral_id, NEW.id, commission_amount, 'approved', now())
        ON CONFLICT (order_id) DO UPDATE
          SET status = 'approved', approved_at = EXCLUDED.approved_at, amount = EXCLUDED.amount;

        -- Ensure referral marked completed
        UPDATE public.referrals 
        SET status = 'completed', completed_at = now()
        WHERE id = NEW.referral_id AND status <> 'completed';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers for insert and status update
DROP TRIGGER IF EXISTS on_order_insert_create_commission ON public.orders;
CREATE TRIGGER on_order_insert_create_commission
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_order_creation();

DROP TRIGGER IF EXISTS on_order_status_update_commission ON public.orders;
CREATE TRIGGER on_order_status_update_commission
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_order_completion();