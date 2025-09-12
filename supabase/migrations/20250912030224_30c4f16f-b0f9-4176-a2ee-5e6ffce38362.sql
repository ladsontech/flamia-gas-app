-- Fix referral creation by removing status dependency
-- Update the create_referral_on_signup function to create active referrals immediately

CREATE OR REPLACE FUNCTION public.create_referral_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  referrer_profile_id UUID;
  referral_code_param TEXT;
BEGIN
  -- Get referral code from raw_user_meta_data
  referral_code_param := NEW.raw_user_meta_data ->> 'referral_code';
  
  IF referral_code_param IS NOT NULL AND referral_code_param != '' THEN
    -- Find the referrer by their referral code (case insensitive)
    SELECT id INTO referrer_profile_id 
    FROM public.profiles 
    WHERE UPPER(referral_code) = UPPER(referral_code_param);
    
    IF referrer_profile_id IS NOT NULL THEN
      -- Create referral record with 'active' status immediately
      INSERT INTO public.referrals (referrer_id, referred_user_id, referral_code, status)
      VALUES (referrer_profile_id, NEW.id, UPPER(referral_code_param), 'active')
      ON CONFLICT (referrer_id, referred_user_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update the process_delayed_referral function to create active referrals
CREATE OR REPLACE FUNCTION public.process_delayed_referral(user_id_param uuid, referral_code_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  referrer_profile_id UUID;
BEGIN
  -- Find the referrer by their referral code (case insensitive)
  SELECT id INTO referrer_profile_id 
  FROM public.profiles 
  WHERE UPPER(referral_code) = UPPER(referral_code_param);
  
  IF referrer_profile_id IS NOT NULL THEN
    -- Create referral record with 'active' status immediately
    INSERT INTO public.referrals (referrer_id, referred_user_id, referral_code, status)
    VALUES (referrer_profile_id, user_id_param, UPPER(referral_code_param), 'active')
    ON CONFLICT (referrer_id, referred_user_id) DO NOTHING;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$function$;

-- Update existing pending referrals to active status
UPDATE public.referrals 
SET status = 'active' 
WHERE status = 'pending';