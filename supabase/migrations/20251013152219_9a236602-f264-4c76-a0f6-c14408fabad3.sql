-- Create push subscriptions table to store user notification subscriptions
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(endpoint)
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own subscriptions
CREATE POLICY "Users can insert their own subscriptions"
  ON public.push_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own subscriptions"
  ON public.push_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON public.push_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON public.push_subscriptions
  FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create push notifications log table
CREATE TABLE public.push_notifications_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  target_page text NOT NULL,
  sent_by uuid REFERENCES auth.users(id),
  sent_at timestamp with time zone DEFAULT now() NOT NULL,
  total_sent integer DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.push_notifications_log ENABLE ROW LEVEL SECURITY;

-- Only admins can manage notifications log
CREATE POLICY "Admins can manage notifications log"
  ON public.push_notifications_log
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));