-- Fix referral and ordering issues

-- Add missing INSERT policy for orders so authenticated users can create orders
CREATE POLICY "Users can create their own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);