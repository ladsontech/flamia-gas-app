-- Create gadgets table for the gadgets store
CREATE TABLE public.gadgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2), -- Optional cancelled price
  category TEXT NOT NULL,
  brand TEXT,
  image_url TEXT,
  features TEXT[], -- Array of product features
  in_stock BOOLEAN NOT NULL DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0, -- Product rating out of 5
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.gadgets ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to gadgets
CREATE POLICY "Gadgets are viewable by everyone" 
ON public.gadgets 
FOR SELECT 
USING (true);

-- Create policy for admin insert access
CREATE POLICY "Admins can insert gadgets" 
ON public.gadgets 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email = 'admin@flamia.com'
  )
);

-- Create policy for admin update access
CREATE POLICY "Admins can update gadgets" 
ON public.gadgets 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email = 'admin@flamia.com'
  )
);

-- Create policy for admin delete access
CREATE POLICY "Admins can delete gadgets" 
ON public.gadgets 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email = 'admin@flamia.com'
  )
);

-- Create indexes for better performance
CREATE INDEX idx_gadgets_category ON public.gadgets(category);
CREATE INDEX idx_gadgets_brand ON public.gadgets(brand);
CREATE INDEX idx_gadgets_name_search ON public.gadgets USING gin(to_tsvector('english', name));
CREATE INDEX idx_gadgets_description_search ON public.gadgets USING gin(to_tsvector('english', description));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_gadgets_updated_at
  BEFORE UPDATE ON public.gadgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample gadgets data
INSERT INTO public.gadgets (name, description, price, original_price, category, brand, image_url, features, stock_quantity, rating, total_reviews) VALUES
('iPhone 15 Pro Max', 'Latest Apple flagship with titanium design and A17 Pro chip', 1299.99, 1399.99, 'Smartphones', 'Apple', 'https://images.unsplash.com/photo-1592910147149-5fe5adad7e90?w=500', ARRAY['6.7-inch display', 'A17 Pro chip', '128GB storage', 'Triple camera system'], 25, 4.8, 156),
('Samsung Galaxy S24 Ultra', 'Premium Android phone with S Pen and amazing cameras', 1199.99, 1299.99, 'Smartphones', 'Samsung', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', ARRAY['6.8-inch display', 'Snapdragon 8 Gen 3', 'S Pen included', '200MP camera'], 18, 4.7, 89),
('MacBook Air M3', 'Thin and light laptop with incredible performance', 1099.99, 1199.99, 'Laptops', 'Apple', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500', ARRAY['13.6-inch display', 'M3 chip', '8GB RAM', '256GB SSD'], 12, 4.9, 234),
('Dell XPS 13', 'Premium Windows ultrabook with stunning display', 999.99, 1099.99, 'Laptops', 'Dell', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500', ARRAY['13.4-inch InfinityEdge', 'Intel Core i7', '16GB RAM', '512GB SSD'], 8, 4.6, 78),
('Sony WH-1000XM5', 'Industry-leading noise canceling headphones', 399.99, 449.99, 'Audio', 'Sony', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', ARRAY['30-hour battery', 'Active noise canceling', 'Multipoint connection', 'Touch controls'], 45, 4.8, 312),
('Apple Watch Series 9', 'Advanced health and fitness tracking', 399.99, 429.99, 'Wearables', 'Apple', 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500', ARRAY['Always-On Retina display', 'S9 chip', 'Health monitoring', 'Water resistant'], 33, 4.7, 198),
('iPad Pro 12.9"', 'Professional tablet with M2 chip', 1099.99, 1199.99, 'Tablets', 'Apple', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500', ARRAY['12.9-inch Liquid Retina', 'M2 chip', 'Apple Pencil support', '128GB storage'], 15, 4.8, 167),
('Google Pixel 8 Pro', 'AI-powered photography and pure Android', 999.99, 1099.99, 'Smartphones', 'Google', 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=500', ARRAY['6.7-inch display', 'Google Tensor G3', '128GB storage', 'Magic Eraser'], 22, 4.6, 93);