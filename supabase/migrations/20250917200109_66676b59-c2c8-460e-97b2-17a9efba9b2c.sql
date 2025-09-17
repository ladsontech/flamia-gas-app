-- Add indexes for better performance on user fetching
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_status ON public.referrals(referrer_id, status);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_user_permission ON public.admin_permissions(user_id, permission);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles(full_name);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);