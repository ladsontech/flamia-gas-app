-- Retroactively link existing orders to referrals
-- This will update orders that don't have referral_id set but should have one

UPDATE public.orders 
SET referral_id = referrals.id
FROM public.referrals
WHERE orders.referral_id IS NULL 
  AND orders.user_id IS NOT NULL
  AND referrals.referred_user_id = orders.user_id
  AND referrals.status = 'active';

-- Create commissions for completed orders that now have referral_id
INSERT INTO public.commissions (referral_id, order_id, amount, status, approved_at)
SELECT 
  orders.referral_id,
  orders.id,
  calculate_commission(orders.description) as amount,
  'approved' as status,
  now() as approved_at
FROM public.orders
WHERE orders.status = 'completed'
  AND orders.referral_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.commissions 
    WHERE commissions.order_id = orders.id
  )
  AND calculate_commission(orders.description) > 0;