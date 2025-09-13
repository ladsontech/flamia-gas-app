-- Fix commissions policy to properly handle commission access and notifications

-- Drop the old policy that references auth.users
DROP POLICY IF EXISTS "Admins can manage all commissions" ON public.commissions;

-- Create proper admin policy using has_role function
CREATE POLICY "Super admins can manage all commissions"
ON public.commissions
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));