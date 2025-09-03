-- Fix security issues from linter

-- Enable RLS on phone_verifications table (if it wasn't enabled)
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;

-- Create missing RLS policies for phone_verifications
CREATE POLICY "Phone verifications are only accessible during verification process" 
ON public.phone_verifications 
FOR ALL 
USING (false); -- No direct access to verification codes

-- Fix function search paths by adding SET search_path = public
CREATE OR REPLACE FUNCTION generate_referral_code(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code text;
  exists_check boolean;
BEGIN
  LOOP
    -- Generate a random 8-character code
    code := upper(substring(md5(random()::text || user_id::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = code) INTO exists_check;
    
    -- Exit loop if code is unique
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION calculate_commission(order_description text)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  commission numeric := 0;
BEGIN
  -- Commission rules based on order description
  IF order_description ILIKE '%full kit%' OR order_description ILIKE '%kit%' THEN
    commission := 10000; -- Full kits: UGX 10,000
  ELSIF order_description ILIKE '%12kg%' OR order_description ILIKE '%12 kg%' THEN
    commission := 10000; -- 12kg cylinder: UGX 10,000
  ELSIF order_description ILIKE '%6kg%' OR order_description ILIKE '%6 kg%' THEN
    commission := 5000; -- 6kg cylinder: UGX 5,000
  ELSIF order_description ILIKE '%3kg%' OR order_description ILIKE '%3 kg%' THEN
    commission := 3000; -- 3kg cylinder: UGX 3,000
  END IF;
  
  RETURN commission;
END;
$$;

CREATE OR REPLACE FUNCTION handle_order_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referral_record public.referrals%ROWTYPE;
  commission_amount numeric;
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Check if this order has a referral
    IF NEW.referral_id IS NOT NULL THEN
      -- Get referral record
      SELECT * INTO referral_record FROM public.referrals WHERE id = NEW.referral_id;
      
      IF referral_record IS NOT NULL THEN
        -- Calculate commission
        commission_amount := calculate_commission(NEW.description);
        
        -- Only create commission if amount > 0 (gas orders only)
        IF commission_amount > 0 THEN
          -- Insert commission record
          INSERT INTO public.commissions (referral_id, order_id, amount, status, approved_at)
          VALUES (NEW.referral_id, NEW.id, commission_amount, 'approved', now());
          
          -- Mark referral as completed if not already
          UPDATE public.referrals 
          SET status = 'completed', completed_at = now()
          WHERE id = NEW.referral_id AND status = 'pending';
        END IF;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix other function search paths
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, display_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'display_name'),
    COALESCE(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name')
  );
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_addresses_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;