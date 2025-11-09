-- Create the Flamia business record if it doesn't exist
INSERT INTO public.businesses (id, name, location, contact, description, owner_type, is_active, is_featured)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Flamia',
  'Kampala, Uganda',
  '+256 XXX XXX XXX',
  'Official Flamia products and services',
  'flamia',
  true,
  true
)
ON CONFLICT (id) DO UPDATE SET
  is_active = true,
  owner_type = 'flamia';