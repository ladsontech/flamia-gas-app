-- Enable RLS on orders table (this was missing)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Fix the authenticate_delivery_man function search path
CREATE OR REPLACE FUNCTION public.authenticate_delivery_man(email_input text, password_input text)
RETURNS TABLE(id uuid, name text, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT dm.id, dm.name, dm.email
  FROM public.delivery_men dm
  WHERE dm.email = email_input 
  AND dm.password_hash = crypt(password_input, dm.password_hash);
END;
$$;