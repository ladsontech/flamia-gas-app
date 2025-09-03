-- Add referral_id to orders table to track which referral generated the order
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'referral_id' AND table_schema = 'public') THEN
        ALTER TABLE public.orders ADD COLUMN referral_id uuid;
    END IF;
END $$;

-- Create referrals table to track referral relationships
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  UNIQUE(referrer_id, referred_user_id)
);

-- Create commissions table to track referral commissions
CREATE TABLE IF NOT EXISTS public.commissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_id uuid NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  approved_at timestamp with time zone,
  UNIQUE(order_id)
);

-- Enable RLS on new tables
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own referrals as referrer" ON public.referrals;
DROP POLICY IF EXISTS "Users can view referrals they were referred by" ON public.referrals;
DROP POLICY IF EXISTS "Users can create referrals" ON public.referrals;
DROP POLICY IF EXISTS "Users can update their own referrals" ON public.referrals;
DROP POLICY IF EXISTS "Users can view their own commissions" ON public.commissions;
DROP POLICY IF EXISTS "Admins can manage all commissions" ON public.commissions;

-- RLS policies for referrals
CREATE POLICY "Users can view their own referrals as referrer" 
ON public.referrals 
FOR SELECT 
USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view referrals they were referred by" 
ON public.referrals 
FOR SELECT 
USING (auth.uid() = referred_user_id);

CREATE POLICY "Users can create referrals" 
ON public.referrals 
FOR INSERT 
WITH CHECK (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE POLICY "Users can update their own referrals" 
ON public.referrals 
FOR UPDATE 
USING (auth.uid() = referrer_id);

-- RLS policies for commissions
CREATE POLICY "Users can view their own commissions" 
ON public.commissions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.referrals 
  WHERE referrals.id = commissions.referral_id 
  AND referrals.referrer_id = auth.uid()
));

-- Admin policies for managing commissions
CREATE POLICY "Admins can manage all commissions" 
ON public.commissions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM auth.users 
  WHERE users.id = auth.uid() 
  AND users.email = 'admin@flamia.com'
));