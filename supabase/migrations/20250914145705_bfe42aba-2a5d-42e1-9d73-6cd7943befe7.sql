-- Allow referrers to view orders they referred so earnings can be computed
CREATE POLICY "Referrers can view orders they referred"
ON public.orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.referrals r
    WHERE r.id = orders.referral_id
      AND r.referrer_id = auth.uid()
  )
);
