-- Add RLS policy to allow users to view profiles of users they have referred
CREATE POLICY "Users can view profiles of users they have referred" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.referrals 
    WHERE referrals.referred_user_id = profiles.id 
    AND referrals.referrer_id = auth.uid()
  )
);