-- Allow super admins to view all referrals for user management
CREATE POLICY "Super admins can view all referrals"
ON public.referrals
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));