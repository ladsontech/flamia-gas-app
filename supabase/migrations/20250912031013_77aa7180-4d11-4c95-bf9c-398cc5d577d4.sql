-- Tighten profiles RLS: remove permissive insert policy added earlier
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Allow profile creation during user registration'
  ) THEN
    DROP POLICY "Allow profile creation during user registration" ON public.profiles;
  END IF;
END $$;

-- Ensure the standard insert policy exists (id must equal auth.uid())
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);
  END IF;
END $$;