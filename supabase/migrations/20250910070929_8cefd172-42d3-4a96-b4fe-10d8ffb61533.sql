-- Fix the create_referral_on_signup trigger function to handle Google OAuth signup
CREATE OR REPLACE FUNCTION public.create_referral_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  referrer_profile_id UUID;
  referral_code_param TEXT;
BEGIN
  -- Get referral code from raw_user_meta_data
  referral_code_param := NEW.raw_user_meta_data ->> 'referral_code';
  
  IF referral_code_param IS NOT NULL THEN
    -- Find the referrer by their referral code (case insensitive)
    SELECT id INTO referrer_profile_id 
    FROM public.profiles 
    WHERE UPPER(referral_code) = UPPER(referral_code_param);
    
    IF referrer_profile_id IS NOT NULL THEN
      -- Create referral record
      INSERT INTO public.referrals (referrer_id, referred_user_id, referral_code, status)
      VALUES (referrer_profile_id, NEW.id, UPPER(referral_code_param), 'pending');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_referral_on_signup();

-- Create a function to handle post-signup referral processing for Google OAuth
CREATE OR REPLACE FUNCTION public.process_delayed_referral(user_id_param UUID, referral_code_param TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  referrer_profile_id UUID;
BEGIN
  -- Find the referrer by their referral code (case insensitive)
  SELECT id INTO referrer_profile_id 
  FROM public.profiles 
  WHERE UPPER(referral_code) = UPPER(referral_code_param);
  
  IF referrer_profile_id IS NOT NULL THEN
    -- Create referral record if it doesn't exist
    INSERT INTO public.referrals (referrer_id, referred_user_id, referral_code, status)
    VALUES (referrer_profile_id, user_id_param, UPPER(referral_code_param), 'pending')
    ON CONFLICT DO NOTHING;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$function$;