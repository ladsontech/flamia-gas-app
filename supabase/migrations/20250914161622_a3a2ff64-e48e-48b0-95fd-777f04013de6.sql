-- Add cancellation fields to orders table
ALTER TABLE public.orders 
ADD COLUMN cancelled_at timestamp with time zone,
ADD COLUMN cancellation_reason text,
ADD COLUMN cancelled_by uuid REFERENCES auth.users(id);

-- Create notifications table for system-wide notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to handle order cancellation
CREATE OR REPLACE FUNCTION public.cancel_order_with_notification(
  order_id_param uuid,
  cancelled_by_param uuid,
  cancellation_reason_param text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_record RECORD;
  referrer_user_id uuid;
BEGIN
  -- Get order details
  SELECT * INTO order_record FROM public.orders WHERE id = order_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  -- Update order with cancellation info
  UPDATE public.orders 
  SET 
    status = 'cancelled',
    cancelled_at = now(),
    cancellation_reason = cancellation_reason_param,
    cancelled_by = cancelled_by_param
  WHERE id = order_id_param;
  
  -- Cancel related commission if exists
  UPDATE public.commissions 
  SET status = 'cancelled'
  WHERE order_id = order_id_param;
  
  -- Notify the order customer if they exist
  IF order_record.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      order_record.user_id,
      'order_cancelled',
      'Order Cancelled',
      'Your order has been cancelled: ' || cancellation_reason_param,
      jsonb_build_object('order_id', order_id_param, 'reason', cancellation_reason_param)
    );
  END IF;
  
  -- Notify the referrer if there's a referral
  IF order_record.referral_id IS NOT NULL THEN
    SELECT referrer_id INTO referrer_user_id 
    FROM public.referrals 
    WHERE id = order_record.referral_id;
    
    IF referrer_user_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, title, message, data)
      VALUES (
        referrer_user_id,
        'referral_order_cancelled',
        'Referral Order Cancelled',
        'An order from your referral has been cancelled: ' || cancellation_reason_param,
        jsonb_build_object('order_id', order_id_param, 'reason', cancellation_reason_param)
      );
    END IF;
  END IF;
END;
$$;