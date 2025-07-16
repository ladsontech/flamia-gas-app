
-- Add featured column to gadgets table
ALTER TABLE public.gadgets ADD COLUMN featured boolean NOT NULL DEFAULT false;
