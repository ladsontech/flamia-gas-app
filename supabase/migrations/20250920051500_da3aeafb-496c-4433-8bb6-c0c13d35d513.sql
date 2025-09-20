-- Add location fields to orders table
ALTER TABLE public.orders 
ADD COLUMN delivery_address TEXT,
ADD COLUMN delivery_latitude DECIMAL,
ADD COLUMN delivery_longitude DECIMAL;