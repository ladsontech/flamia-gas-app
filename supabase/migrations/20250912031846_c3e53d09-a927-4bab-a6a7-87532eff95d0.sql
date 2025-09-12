-- Add super_admin role to the current admin user
-- First, let's check if we have an admin email and grant super_admin role

-- Insert super_admin role for admin user (adjust email as needed)
INSERT INTO public.user_roles (user_id, role)
SELECT 
  au.id, 
  'super_admin'::app_role
FROM auth.users au
WHERE au.email = 'admin@flamia.com'  -- Replace with your actual admin email
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = au.id AND ur.role = 'super_admin'
  );

-- Also ensure any user accessing admin functionality gets super_admin role
-- You may need to update this email to match your actual admin account
UPDATE public.user_roles 
SET role = 'super_admin'::app_role 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email LIKE '%admin%' OR email = 'your-admin-email@example.com'
)
AND role != 'super_admin';

-- If no admin user exists, you'll need to sign up with an admin email first