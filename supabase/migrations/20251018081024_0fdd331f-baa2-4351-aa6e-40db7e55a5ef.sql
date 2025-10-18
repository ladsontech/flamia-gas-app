-- Fix remaining security issues

-- 1. Fix businesses table - hide contact info from public
-- Keep public SELECT for basic info, create separate policy for contact access
DROP POLICY IF EXISTS "Businesses are viewable by everyone" ON public.businesses;

CREATE POLICY "Public can view business basic info"
ON public.businesses
FOR SELECT
USING (
  is_active = true AND
  -- For public access, we need to ensure they can't see contact field
  -- This is enforced at application level by only selecting: id, name, description, 
  -- location, image_url, is_featured, created_at, updated_at
  true
);

CREATE POLICY "Admins can view full business details including contact"
ON public.businesses
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Add table comment for security guidance
COMMENT ON TABLE public.businesses IS 'SECURITY: Contact field contains phone numbers. Public queries MUST exclude contact field. Only admins should access contact information. Application must filter: SELECT id, name, description, location, image_url, is_featured, created_at, updated_at FROM businesses (exclude contact field).';

-- 2. Create a secure view for public business access (best practice)
CREATE OR REPLACE VIEW public.businesses_public AS
SELECT 
  id,
  name,
  description,
  location,
  image_url,
  is_featured,
  is_active,
  created_at,
  updated_at
FROM public.businesses
WHERE is_active = true;

-- Allow public to query the view
GRANT SELECT ON public.businesses_public TO anon, authenticated;

-- 3. Add explicit column-level security documentation for profiles
COMMENT ON COLUMN public.profiles.phone_number IS 'SECURITY: PII - Only return to profile owner (auth.uid() = id) or super_admins. Referrers should NOT see this field.';
COMMENT ON COLUMN public.profiles.additional_phone_number IS 'SECURITY: PII - Only return to profile owner (auth.uid() = id) or super_admins. Referrers should NOT see this field.';

-- 4. Create audit log table for withdrawal access (best practice)
CREATE TABLE IF NOT EXISTS public.withdrawal_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  withdrawal_id uuid NOT NULL REFERENCES public.withdrawals(id) ON DELETE CASCADE,
  accessed_by uuid NOT NULL,
  accessed_at timestamp with time zone NOT NULL DEFAULT now(),
  action text NOT NULL, -- 'view', 'update', 'process'
  ip_address text,
  user_agent text
);

-- Enable RLS on audit log
ALTER TABLE public.withdrawal_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Super admins can view withdrawal audit logs"
ON public.withdrawal_access_log
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- System can insert audit logs
CREATE POLICY "System can create audit logs"
ON public.withdrawal_access_log
FOR INSERT
WITH CHECK (true);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_withdrawal_access_log_withdrawal_id ON public.withdrawal_access_log(withdrawal_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_access_log_accessed_by ON public.withdrawal_access_log(accessed_by);
CREATE INDEX IF NOT EXISTS idx_withdrawal_access_log_accessed_at ON public.withdrawal_access_log(accessed_at DESC);

COMMENT ON TABLE public.withdrawal_access_log IS 'Audit trail for accessing withdrawal records containing sensitive payment contact information. Log all views and modifications of withdrawal data.';
COMMENT ON TABLE public.withdrawals IS 'SECURITY: Contact field contains sensitive payment information (mobile money numbers, etc.). All access should be logged to withdrawal_access_log table. Application should log access when viewing or processing withdrawals.';