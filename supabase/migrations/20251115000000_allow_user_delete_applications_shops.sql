-- Allow users to delete their own pending seller applications
CREATE POLICY "Users can delete their own pending applications"
ON public.seller_applications FOR DELETE
USING (
  auth.uid() = user_id 
  AND status = 'pending'
);

-- Allow users to delete their own seller shops
CREATE POLICY "Users can delete their own shops"
ON public.seller_shops FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to delete their own affiliate shops
CREATE POLICY "Users can delete their own affiliate shops"
ON public.affiliate_shops FOR DELETE
USING (auth.uid() = user_id);

