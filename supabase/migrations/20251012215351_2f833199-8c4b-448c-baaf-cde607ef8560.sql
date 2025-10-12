-- Update the RLS policy so delivery men only see assigned orders, not their own orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (
  auth.uid() = user_id 
  AND NOT has_role(auth.uid(), 'delivery_man'::app_role)
);