-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('super_admin', 'business_owner', 'delivery_man', 'user');

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role, business_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS app_role
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = user_uuid LIMIT 1;
$$;

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(user_uuid UUID, check_role app_role)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid AND role = check_role
  );
$$;

-- Create function to get user businesses
CREATE OR REPLACE FUNCTION public.get_user_businesses(user_uuid UUID)
RETURNS TABLE(business_id UUID)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT ur.business_id FROM public.user_roles ur 
  WHERE ur.user_id = user_uuid AND ur.role = 'business_owner' AND ur.business_id IS NOT NULL;
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Update orders RLS policies
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Delivery men can update assigned orders" ON public.orders;
DROP POLICY IF EXISTS "Delivery men can view assigned orders" ON public.orders;

CREATE POLICY "Super admins can manage all orders" ON public.orders
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Business owners can view their business orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.get_user_businesses(auth.uid()) ub
      WHERE description ILIKE '%' || (SELECT name FROM public.businesses WHERE id = ub.business_id) || '%'
    )
  );

CREATE POLICY "Delivery men can view assigned orders" ON public.orders
  FOR SELECT USING (
    public.has_role(auth.uid(), 'delivery_man') AND 
    delivery_man_id IS NOT NULL AND 
    delivery_man_id::text = auth.uid()::text
  );

CREATE POLICY "Delivery men can update assigned orders" ON public.orders
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'delivery_man') AND 
    delivery_man_id IS NOT NULL AND 
    delivery_man_id::text = auth.uid()::text
  );

-- Fix referrals tracking function
CREATE OR REPLACE FUNCTION public.create_referral_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referrer_profile_id UUID;
  referral_code_param TEXT;
BEGIN
  -- Get referral code from raw_user_meta_data
  referral_code_param := NEW.raw_user_meta_data ->> 'referral_code';
  
  IF referral_code_param IS NOT NULL THEN
    -- Find the referrer by their referral code
    SELECT id INTO referrer_profile_id 
    FROM public.profiles 
    WHERE referral_code = UPPER(referral_code_param);
    
    IF referrer_profile_id IS NOT NULL THEN
      -- Create referral record
      INSERT INTO public.referrals (referrer_id, referred_user_id, referral_code, status)
      VALUES (referrer_profile_id, NEW.id, UPPER(referral_code_param), 'pending');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for referral tracking
DROP TRIGGER IF EXISTS on_auth_user_referral_created ON auth.users;
CREATE TRIGGER on_auth_user_referral_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_referral_on_signup();

-- Update trigger for updated_at
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();