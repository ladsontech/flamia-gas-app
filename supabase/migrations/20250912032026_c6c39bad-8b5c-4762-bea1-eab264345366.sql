-- Allow super_admins to view all profiles (needed to list delivery men)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Super admins can view all profiles'
  ) THEN
    CREATE POLICY "Super admins can view all profiles"
    ON public.profiles
    FOR SELECT
    USING (has_role(auth.uid(), 'super_admin'));
  END IF;
END $$;