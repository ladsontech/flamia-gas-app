-- Add constraint to ensure admin_permissions only references super_admin users
-- First, create a function to validate super_admin role
CREATE OR REPLACE FUNCTION validate_admin_permission_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user has super_admin role
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = NEW.user_id AND role = 'super_admin'::app_role
  ) THEN
    RAISE EXCEPTION 'Admin permissions can only be assigned to users with super_admin role';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to validate on insert/update
CREATE TRIGGER validate_admin_permission_user_trigger
  BEFORE INSERT OR UPDATE ON public.admin_permissions
  FOR EACH ROW EXECUTE FUNCTION validate_admin_permission_user();

-- Add index for better performance on the relationship
CREATE INDEX IF NOT EXISTS idx_admin_permissions_user_id ON public.admin_permissions(user_id);