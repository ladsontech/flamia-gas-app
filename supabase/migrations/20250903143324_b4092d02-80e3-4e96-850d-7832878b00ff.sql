-- Add referral_id to orders table to track which referral generated the order
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS referral_id uuid;

-- Create referrals table to track referral relationships
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, completed
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
  status text NOT NULL DEFAULT 'pending', -- pending, approved
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  approved_at timestamp with time zone,
  UNIQUE(order_id) -- Each order can only generate one commission
);

-- Enable RLS on new tables
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

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

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(user_id uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  code text;
  exists_check boolean;
BEGIN
  LOOP
    -- Generate a random 8-character code
    code := upper(substring(md5(random()::text || user_id::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = code) INTO exists_check;
    
    -- Exit loop if code is unique
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Function to calculate commission based on order description
CREATE OR REPLACE FUNCTION calculate_commission(order_description text)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  commission numeric := 0;
BEGIN
  -- Commission rules based on order description
  IF order_description ILIKE '%full kit%' OR order_description ILIKE '%kit%' THEN
    commission := 10000; -- Full kits: UGX 10,000
  ELSIF order_description ILIKE '%12kg%' OR order_description ILIKE '%12 kg%' THEN
    commission := 10000; -- 12kg cylinder: UGX 10,000
  ELSIF order_description ILIKE '%6kg%' OR order_description ILIKE '%6 kg%' THEN
    commission := 5000; -- 6kg cylinder: UGX 5,000
  ELSIF order_description ILIKE '%3kg%' OR order_description ILIKE '%3 kg%' THEN
    commission := 3000; -- 3kg cylinder: UGX 3,000
  END IF;
  
  RETURN commission;
END;
$$;

-- Trigger to create commission when order is completed
CREATE OR REPLACE FUNCTION handle_order_completion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  referral_record public.referrals%ROWTYPE;
  commission_amount numeric;
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Check if this order has a referral
    IF NEW.referral_id IS NOT NULL THEN
      -- Get referral record
      SELECT * INTO referral_record FROM public.referrals WHERE id = NEW.referral_id;
      
      IF referral_record IS NOT NULL THEN
        -- Calculate commission
        commission_amount := calculate_commission(NEW.description);
        
        -- Only create commission if amount > 0 (gas orders only)
        IF commission_amount > 0 THEN
          -- Insert commission record
          INSERT INTO public.commissions (referral_id, order_id, amount, status, approved_at)
          VALUES (NEW.referral_id, NEW.id, commission_amount, 'approved', now());
          
          -- Mark referral as completed if not already
          UPDATE public.referrals 
          SET status = 'completed', completed_at = now()
          WHERE id = NEW.referral_id AND status = 'pending';
        END IF;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for order completion
DROP TRIGGER IF EXISTS handle_order_completion_trigger ON public.orders;
CREATE TRIGGER handle_order_completion_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_order_completion();