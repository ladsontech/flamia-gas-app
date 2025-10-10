-- Update handle_new_user function to auto-generate referral codes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_referral_code text;
BEGIN
  -- Generate referral code
  new_referral_code := generate_referral_code(new.id);
  
  -- Insert profile with referral code
  INSERT INTO public.profiles (id, full_name, display_name, referral_code)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'display_name'),
    COALESCE(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name'),
    new_referral_code
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    referral_code = COALESCE(EXCLUDED.referral_code, profiles.referral_code),
    updated_at = now();
    
  RETURN new;
END;
$$;

-- Generate referral codes for existing users who don't have one
DO $$
DECLARE
  user_record RECORD;
  new_code text;
BEGIN
  FOR user_record IN 
    SELECT id FROM public.profiles WHERE referral_code IS NULL
  LOOP
    new_code := generate_referral_code(user_record.id);
    UPDATE public.profiles 
    SET referral_code = new_code 
    WHERE id = user_record.id;
  END LOOP;
END $$;