-- Update the has_admin_permission function to work with the existing role system
CREATE OR REPLACE FUNCTION public.has_admin_permission(user_uuid uuid, permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- First check if user is super_admin
  SELECT CASE 
    WHEN has_role(user_uuid, 'super_admin'::app_role) THEN
      -- If they have specific permissions set, check those
      CASE 
        WHEN EXISTS (SELECT 1 FROM public.admin_permissions WHERE user_id = user_uuid) THEN
          EXISTS (SELECT 1 FROM public.admin_permissions WHERE user_id = user_uuid AND permission = permission_name)
        -- If no specific permissions set, they have all permissions (backward compatibility)
        ELSE true
      END
    -- Non-super admins have no admin permissions
    ELSE false
  END;
$$;