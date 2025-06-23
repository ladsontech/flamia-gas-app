
-- Create table for storing phone verification codes
CREATE TABLE public.phone_verifications (
  phone_number TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for cleanup of expired codes
CREATE INDEX idx_phone_verifications_expires_at ON public.phone_verifications(expires_at);
