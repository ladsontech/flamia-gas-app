import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { AuthError } from "@supabase/supabase-js";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session) {
          try {
            const { data: userData } = await supabase
              .from('users')
              .select('admin')
              .eq('id', session.user.id)
              .single();

            if (userData?.admin === 'admin') {
              navigate('/dashboard');
            } else {
              navigate('/');
            }
          } catch (error) {
            console.error('Error checking user role:', error);
            navigate('/');
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleGuestAccess = () => {
    toast({
      title: "Continuing as Guest",
      description: "You can place orders without signing in",
    });
    navigate('/order');
  };

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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Button
            onClick={handleGuestAccess}
            className="w-full bg-accent/10 text-accent hover:bg-accent/20 mb-4"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Continue as Guest
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
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
        </motion.div>
      </div>
    </div>
  );
};

export default Login;