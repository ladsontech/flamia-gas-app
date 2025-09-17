-- Create admin permissions table
CREATE TABLE public.admin_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  permission TEXT NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, permission)
);

-- Enable RLS
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Super admins can manage all permissions" 
ON public.admin_permissions 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view their own permissions" 
ON public.admin_permissions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_admin_permissions_user_id ON public.admin_permissions(user_id);
CREATE INDEX idx_admin_permissions_permission ON public.admin_permissions(permission);

-- Add trigger for updated_at
CREATE TRIGGER update_admin_permissions_updated_at
BEFORE UPDATE ON public.admin_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check admin permissions
CREATE OR REPLACE FUNCTION public.has_admin_permission(user_uuid uuid, permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_permissions 
    WHERE user_id = user_uuid AND permission = permission_name
  ) OR has_role(user_uuid, 'super_admin'::app_role);
$$;