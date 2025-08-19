
-- Add password_hash column to profiles table for phone-based authentication
ALTER TABLE public.profiles ADD COLUMN password_hash text;
