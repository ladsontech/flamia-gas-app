-- Fix user creation issues with profiles table

-- Update the handle_new_user function to handle conflicts and RLS properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert profile with conflict handling to prevent duplicate key errors
  INSERT INTO public.profiles (id, full_name, display_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'display_name'),
    COALESCE(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    updated_at = now();
    
  RETURN new;
END;
$function$;

-- Update RLS policy for profiles to allow the trigger function to insert
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Add a policy that allows the system to insert profiles during user creation
CREATE POLICY "System can insert profiles during signup" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- But make the system policy more restrictive by only allowing it during the trigger context
-- Update the policy to be more specific
DROP POLICY IF EXISTS "System can insert profiles during signup" ON public.profiles;

-- Create a more secure policy that allows inserts when there's no current user context (trigger execution)
CREATE POLICY "Allow profile creation during user registration" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  -- Allow if it's the user themselves OR if there's no auth context (system trigger)
  auth.uid() = id OR auth.uid() IS NULL
);