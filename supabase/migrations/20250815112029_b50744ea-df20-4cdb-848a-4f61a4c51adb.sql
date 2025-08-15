
-- Create businesses table
CREATE TABLE public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  contact TEXT NOT NULL,
  description TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_products table
CREATE TABLE public.business_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  image_url TEXT,
  category TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_products ENABLE ROW LEVEL SECURITY;

-- RLS policies for businesses table
CREATE POLICY "Businesses are viewable by everyone" 
  ON public.businesses 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Anyone can manage businesses" 
  ON public.businesses 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- RLS policies for business_products table
CREATE POLICY "Business products are viewable by everyone" 
  ON public.business_products 
  FOR SELECT 
  USING (is_available = true);

CREATE POLICY "Anyone can manage business products" 
  ON public.business_products 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Add trigger for updated_at on businesses
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on business_products
CREATE TRIGGER update_business_products_updated_at
  BEFORE UPDATE ON public.business_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_business_products_business_id ON public.business_products(business_id);
CREATE INDEX idx_businesses_featured ON public.businesses(is_featured) WHERE is_featured = true;
CREATE INDEX idx_business_products_featured ON public.business_products(is_featured) WHERE is_featured = true;
