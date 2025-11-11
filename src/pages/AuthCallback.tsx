import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get return_to from query params
        const params = new URLSearchParams(location.search);
        const returnTo = params.get('return_to');

        // Wait for session to be established
        const { data: { session } } = await supabase.auth.getSession();

        if (returnTo) {
          // Redirect back to the storefront or original page
          window.location.href = returnTo;
        } else if (session) {
          // Default redirect to account
          navigate('/account');
        } else {
          // No session, go home
          navigate('/');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;

