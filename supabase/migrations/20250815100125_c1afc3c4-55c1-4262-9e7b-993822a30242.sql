
-- Create table for promotional offers
CREATE TABLE public.promotional_offers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  price text,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on promotional_offers table
ALTER TABLE public.promotional_offers ENABLE ROW LEVEL SECURITY;

-- Create policies for promotional_offers
CREATE POLICY "Promotional offers are viewable by everyone" 
  ON public.promotional_offers 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Anyone can manage promotional offers" 
  ON public.promotional_offers 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Create storage bucket for promotional offer images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('promotions', 'promotions', true);

-- Create RLS policies for the promotions bucket
CREATE POLICY "Promotional images are publicly viewable" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'promotions');

CREATE POLICY "Anyone can upload promotional images" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'promotions');

CREATE POLICY "Anyone can update promotional images" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'promotions');

CREATE POLICY "Anyone can delete promotional images" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'promotions');

-- Add trigger to update the updated_at column
CREATE TRIGGER update_promotional_offers_updated_at
  BEFORE UPDATE ON public.promotional_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
