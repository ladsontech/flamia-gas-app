-- Fix RLS policy so users can see their own orders even if they're delivery men
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id);

-- Update profiles RLS to allow sub-admins with manage_users permission to view all profiles
DROP POLICY IF EXISTS "Sub-admins with manage_users can view all profiles" ON public.profiles;

CREATE POLICY "Sub-admins with manage_users can view all profiles"
ON public.profiles
FOR SELECT
USING (has_admin_permission(auth.uid(), 'manage_users'));

-- Update referrals RLS to allow sub-admins with manage_commissions to view all referrals
DROP POLICY IF EXISTS "Sub-admins with manage_commissions can view all referrals" ON public.referrals;

CREATE POLICY "Sub-admins with manage_commissions can view all referrals"
ON public.referrals
FOR SELECT
USING (has_admin_permission(auth.uid(), 'manage_commissions'));

-- Update commissions RLS to allow sub-admins with manage_commissions permission
DROP POLICY IF EXISTS "Super admins can manage all commissions" ON public.commissions;
DROP POLICY IF EXISTS "Sub-admins with manage_commissions can manage commissions" ON public.commissions;

CREATE POLICY "Admins and sub-admins can manage all commissions" 
ON public.commissions 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_admin_permission(auth.uid(), 'manage_commissions')
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_admin_permission(auth.uid(), 'manage_commissions')
);

-- Update withdrawals RLS to allow sub-admins with manage_commissions permission
DROP POLICY IF EXISTS "Admins can manage all withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Sub-admins with manage_commissions can manage withdrawals" ON public.withdrawals;

CREATE POLICY "Admins and sub-admins can manage all withdrawals"
ON public.withdrawals
FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_admin_permission(auth.uid(), 'manage_commissions')
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_admin_permission(auth.uid(), 'manage_commissions')
);