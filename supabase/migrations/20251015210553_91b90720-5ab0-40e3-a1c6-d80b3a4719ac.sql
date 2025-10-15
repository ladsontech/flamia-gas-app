-- Clean up old push subscriptions without FCM tokens
-- Users will need to re-subscribe with the new FCM format
DELETE FROM push_subscriptions WHERE fcm_token IS NULL;