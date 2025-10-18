-- Fix critical security issues

-- 1. Fix businesses table - restrict write operations to super admins only
DROP POLICY IF EXISTS "Anyone can manage businesses" ON public.businesses;

CREATE POLICY "Super admins can manage businesses"
ON public.businesses
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- 2. Fix business_products table - restrict to business owners and admins
DROP POLICY IF EXISTS "Anyone can manage business products" ON public.business_products;

CREATE POLICY "Business owners can manage their products"
ON public.business_products
FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM get_user_businesses(auth.uid()) ub
    WHERE ub.business_id = business_products.business_id
  )
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM get_user_businesses(auth.uid()) ub
    WHERE ub.business_id = business_products.business_id
  )
);

-- 3. Fix gadgets table - restrict write operations to admins only
DROP POLICY IF EXISTS "Anyone can insert gadgets" ON public.gadgets;
DROP POLICY IF EXISTS "Anyone can update gadgets" ON public.gadgets;
DROP POLICY IF EXISTS "Anyone can delete gadgets" ON public.gadgets;

CREATE POLICY "Admins can insert gadgets"
ON public.gadgets
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can update gadgets"
ON public.gadgets
FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can delete gadgets"
ON public.gadgets
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- 4. Fix carousel_images table - restrict to admins only
DROP POLICY IF EXISTS "Anyone can manage carousel images" ON public.carousel_images;

CREATE POLICY "Admins can manage carousel images"
ON public.carousel_images
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- 5. Fix promotional_offers table - restrict to admins only
DROP POLICY IF EXISTS "Anyone can manage promotional offers" ON public.promotional_offers;

CREATE POLICY "Admins can manage promotional offers"
ON public.promotional_offers
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- 6. Fix profiles table - remove password_hash exposure and restrict phone number access
-- Remove password_hash column as it should NEVER be in profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS password_hash;

-- Update profiles policies to hide phone numbers from referrers
DROP POLICY IF EXISTS "Users can view profiles of users they have referred" ON public.profiles;

CREATE POLICY "Referrers can view limited referred user profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM referrals
    WHERE referrals.referred_user_id = profiles.id 
    AND referrals.referrer_id = auth.uid()
  )
  -- Referrers should only see display_name and referral_code, not phone numbers
  -- This is enforced at application level by only selecting those fields
);

-- 7. Improve orders table - limit what delivery personnel can see
DROP POLICY IF EXISTS "Delivery men can view assigned orders" ON public.orders;

CREATE POLICY "Delivery men can view limited order info"
ON public.orders
FOR SELECT
USING (
  has_role(auth.uid(), 'delivery_man'::app_role) 
  AND delivery_man_id IS NOT NULL 
  AND delivery_man_id::text = auth.uid()::text
  -- Note: At application level, only expose: id, description, delivery_address, 
  -- delivery_latitude, delivery_longitude, status, created_at
  -- Hide: total_amount, referral_id, user_id, cancelled_by
);

-- 8. Improve addresses table security - ensure only owner and admins can access
-- Current policies are already restrictive (user_id matching), but let's make admin access explicit
CREATE POLICY "Admins can view all addresses"
ON public.addresses
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Add comment to remind about field-level security
COMMENT ON TABLE public.profiles IS 'SECURITY: Phone numbers should only be returned to profile owner and super admins. Application must filter fields based on requester role.';
COMMENT ON TABLE public.orders IS 'SECURITY: Delivery personnel should only see: id, description, delivery_address, delivery_latitude, delivery_longitude, status. Application must filter fields based on role.';
COMMENT ON TABLE public.addresses IS 'SECURITY: Contains sensitive location data. Only expose to address owner and authorized personnel (admins, assigned delivery person for active orders).';