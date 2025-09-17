-- Performance indexes for orders table
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_man_id ON public.orders (delivery_man_id);
CREATE INDEX IF NOT EXISTS idx_orders_referral_id ON public.orders (referral_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON public.orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_status ON public.orders (delivery_man_id, status);

-- Performance indexes for referrals table
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals (referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON public.referrals (referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals (status);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals (referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON public.referrals (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_status ON public.referrals (referrer_id, status);

-- Performance indexes for commissions table
CREATE INDEX IF NOT EXISTS idx_commissions_referral_id ON public.commissions (referral_id);
CREATE INDEX IF NOT EXISTS idx_commissions_order_id ON public.commissions (order_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.commissions (status);

-- Performance indexes for user_roles table
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles (user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles (role);
CREATE INDEX IF NOT EXISTS idx_user_roles_business_id ON public.user_roles (business_id) WHERE business_id IS NOT NULL;

-- Performance indexes for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles (referral_code) WHERE referral_code IS NOT NULL;

-- Performance indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications (user_id, read, created_at DESC);