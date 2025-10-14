-- Add fcm_token column to push_subscriptions table
ALTER TABLE push_subscriptions 
ADD COLUMN IF NOT EXISTS fcm_token TEXT;

-- Create index on fcm_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_fcm_token 
ON push_subscriptions(fcm_token);

-- Update constraint to allow either old-style or FCM subscriptions
ALTER TABLE push_subscriptions 
DROP CONSTRAINT IF EXISTS push_subscriptions_endpoint_key;

ALTER TABLE push_subscriptions 
ADD CONSTRAINT push_subscriptions_endpoint_key 
UNIQUE (endpoint);