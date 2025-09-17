-- Drop the existing constraint that limited to super_admin only
DROP TRIGGER IF EXISTS validate_admin_permission_user_trigger ON public.admin_permissions;
DROP FUNCTION IF EXISTS validate_admin_permission_user();

-- Create proper admin role enum
CREATE TYPE public.admin_role AS ENUM (
  'manage_orders',
  'manage_withdrawals', 
  'manage_gadgets',
  'manage_brands',
  'manage_businesses',
  'manage_products',
  'manage_seller_applications',
  'manage_promotions',
  'manage_carousel',
  'manage_marketplace_settings'
);

-- Update admin_permissions table to use the enum and allow multiple permissions per user
ALTER TABLE public.admin_permissions DROP COLUMN IF EXISTS permission;
ALTER TABLE public.admin_permissions ADD COLUMN permission admin_role NOT NULL;

-- Add unique constraint to prevent duplicate permission assignments
ALTER TABLE public.admin_permissions ADD CONSTRAINT unique_user_permission UNIQUE (user_id, permission);

-- Update RLS policies to allow super_admins to manage permissions for any user
DROP POLICY IF EXISTS "Super admins can manage all permissions" ON public.admin_permissions;
CREATE POLICY "Super admins can manage all permissions" 
ON public.admin_permissions FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Update the has_admin_permission function to work with the new structure
CREATE OR REPLACE FUNCTION public.has_admin_permission(user_uuid uuid, permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- Check if user is super_admin (has all permissions) or has specific permission
  SELECT CASE 
    WHEN has_role(user_uuid, 'super_admin'::app_role) THEN true
    ELSE EXISTS (
      SELECT 1 FROM public.admin_permissions 
      WHERE user_id = user_uuid AND permission = permission_name::admin_role
    )
  END;
$$;