-- Update commission calculation function
CREATE OR REPLACE FUNCTION public.calculate_commission(order_description text)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  commission numeric := 0;
BEGIN
  -- Commission rules based on order description
  IF order_description ILIKE '%full kit%' OR order_description ILIKE '%kit%' THEN
    commission := 10000; -- Full kits: UGX 10,000
  ELSIF order_description ILIKE '%12kg%' OR order_description ILIKE '%12 kg%' THEN
    commission := 10000; -- 12kg cylinder: UGX 10,000
  ELSIF order_description ILIKE '%6kg%' OR order_description ILIKE '%6 kg%' THEN
    commission := 5000; -- 6kg cylinder: UGX 5,000
  ELSIF order_description ILIKE '%3kg%' OR order_description ILIKE '%3 kg%' THEN
    commission := 4000; -- 3kg cylinder: UGX 4,000 (updated from 3,000)
  END IF;
  
  RETURN commission;
END;
$function$;