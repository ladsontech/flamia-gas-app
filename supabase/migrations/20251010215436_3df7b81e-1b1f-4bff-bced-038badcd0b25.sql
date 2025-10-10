-- Drop existing enum and recreate
DROP TYPE IF EXISTS admin_role CASCADE;

-- Create new admin_role enum matching admin sections
CREATE TYPE admin_role AS ENUM (
  'manage_gas_orders',
  'manage_shop_orders',
  'manage_commissions',
  'manage_users',
  'manage_marketing',
  'manage_gadgets',
  'manage_brands',
  'manage_businesses',
  'manage_products',
  'manage_seller_applications',
  'manage_promotions',
  'manage_carousel'
);

-- Recreate admin_permissions table with new enum
DROP TABLE IF EXISTS public.admin_permissions CASCADE;

CREATE TABLE public.admin_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  permission admin_role NOT NULL,
  granted_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, permission)
);

-- Enable RLS
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Super admins can manage all permissions"
ON public.admin_permissions
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view their own permissions"
ON public.admin_permissions
FOR SELECT
USING (auth.uid() = user_id);

-- Update has_admin_permission function
CREATE OR REPLACE FUNCTION public.has_admin_permission(user_uuid uuid, permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT CASE 
    WHEN has_role(user_uuid, 'super_admin'::app_role) THEN true
    ELSE EXISTS (
      SELECT 1 FROM public.admin_permissions 
      WHERE user_id = user_uuid AND permission::text = permission_name
    )
  END;
$$;