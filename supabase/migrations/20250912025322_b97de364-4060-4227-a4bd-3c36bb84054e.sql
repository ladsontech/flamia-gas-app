-- Add missing columns to referrals for status tracking
ALTER TABLE public.referrals
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;

-- Create withdrawals table
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'pending', -- pending | completed | rejected
  contact text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  processed_at timestamp with time zone,
  admin_note text
);

-- Enable RLS
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Policies for withdrawals
DO $$
BEGIN
  -- Admins can manage all withdrawals
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'withdrawals' AND policyname = 'Admins can manage all withdrawals'
  ) THEN
    CREATE POLICY "Admins can manage all withdrawals" ON public.withdrawals
    FOR ALL USING (has_role(auth.uid(), 'super_admin')) WITH CHECK (has_role(auth.uid(), 'super_admin'));
  END IF;

  -- Users can insert their own withdrawals
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'withdrawals' AND policyname = 'Users can create their own withdrawals'
  ) THEN
    CREATE POLICY "Users can create their own withdrawals" ON public.withdrawals
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Users can view their own withdrawals
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'withdrawals' AND policyname = 'Users can view their own withdrawals'
  ) THEN
    CREATE POLICY "Users can view their own withdrawals" ON public.withdrawals
    FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- Triggers to process referrals on signup and handle user profile creation
-- Create trigger to insert into profiles (if not already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_profile'
  ) THEN
    CREATE TRIGGER on_auth_user_created_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Create trigger to create referral record on signup when referral code provided
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_referral'
  ) THEN
    CREATE TRIGGER on_auth_user_created_referral
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.create_referral_on_signup();
  END IF;
END $$;

-- Trigger to handle commissions when orders are completed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_handle_order_completion'
  ) THEN
    CREATE TRIGGER trg_handle_order_completion
    AFTER UPDATE OF status ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_order_completion();
  END IF;
END $$;