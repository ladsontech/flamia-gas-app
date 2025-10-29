-- Fix security definer view issue
-- Drop the view since it bypasses RLS, use policies instead
DROP VIEW IF EXISTS public.businesses_public;

-- The RLS policies already handle security correctly
-- Applications should query businesses table directly and exclude contact field
-- The policies ensure proper access control