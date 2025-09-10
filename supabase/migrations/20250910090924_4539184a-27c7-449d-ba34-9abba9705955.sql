-- Create profile for existing delivery man user
INSERT INTO public.profiles (id, display_name, full_name) 
VALUES ('842b9599-6767-48c2-86c7-8de17e09495e', 'Delivery Person', 'Delivery Person')
ON CONFLICT (id) DO NOTHING;

-- Create trigger to automatically create profiles when users sign up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger to handle referrals when users sign up  
CREATE OR REPLACE TRIGGER on_user_signup_referral
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_referral_on_signup();