
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session) {
          // Simplified admin check (using local storage for admin role)
          if (localStorage.getItem('userRole') === 'admin') {
            navigate('/dashboard');
          } else {
            navigate('/');
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/20 to-background p-4">
      <div className="w-full max-w-md mx-auto">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
          <p className="text-sm text-muted-foreground mt-1">
            Password must be at least 6 characters long
          </p>
        </div>

        <Card className="p-6">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              style: {
                button: { background: 'hsl(142, 70%, 45%)', color: 'white' },
                anchor: { color: 'hsl(142, 70%, 45%)' },
              },
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(142, 70%, 45%)',
                    brandAccent: 'hsl(142, 70%, 40%)',
                  },
                },
              },
            }}
            providers={[]}
            localization={{
              variables: {
                sign_up: {
                  password_label: 'Password (minimum 6 characters)',
                  password_input_placeholder: 'Enter a strong password (min. 6 characters)',
                },
              },
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default Login;
