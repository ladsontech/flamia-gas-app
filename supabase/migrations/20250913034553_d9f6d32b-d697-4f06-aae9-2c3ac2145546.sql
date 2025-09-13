-- Fix commissions policy to avoid referencing auth.users and add missing FKs for relational selects

-- 1) Drop the old admin policy that references auth.users (causing permission errors)
DROP POLICY IF EXISTS "Admins can manage all commissions" ON public.commissions;

-- 2) Recreate an admin policy using has_role()
CREATE POLICY "Admins can manage all commissions"
ON public.commissions
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- 3) Add missing foreign keys so PostgREST can embed relations
ALTER TABLE public.commissions
  ADD CONSTRAINT commissions_referral_id_fkey
  FOREIGN KEY (referral_id)
  REFERENCES public.referrals(id)
  ON DELETE CASCADE;

ALTER TABLE public.commissions
  ADD CONSTRAINT commissions_order_id_fkey
  FOREIGN KEY (order_id)
  REFERENCES public.orders(id)
  ON DELETE CASCADE;

-- 4) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_commissions_referral_id ON public.commissions(referral_id);
CREATE INDEX IF NOT EXISTS idx_commissions_order_id ON public.commissions(order_id);
