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

        // Perform OAuth code exchange if needed (supports both APIs)
        try {
          // Try string signature
          // @ts-ignore - runtime availability depends on SDK version
          const ex1 = await (supabase.auth as any).exchangeCodeForSession?.(window.location.href);
          if (ex1?.error) {
            // Try object signature
            // @ts-ignore
            await (supabase.auth as any).exchangeCodeForSession?.({ currentUrl: window.location.href });
          }
        } catch (_e) {
          // Ignore; we'll poll session below either way
        }

        // Wait for session to be established (robust on slow networks)
        let session = (await supabase.auth.getSession()).data.session;
        const start = Date.now();
        while (!session && Date.now() - start < 5000) {
          await new Promise(r => setTimeout(r, 200));
          session = (await supabase.auth.getSession()).data.session;
        }

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

