
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Lock, UserPlus } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session) {
          // Check if user has admin role
          if (localStorage.getItem('userRole') === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }
      }
      
      if (event === 'PASSWORD_RECOVERY') {
        toast({
          title: "Password Reset",
          description: "Check your email for password reset instructions",
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

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
          <div className="flex justify-center mb-4">
            <img 
              src="/images/icon.png" 
              alt="Flamia Logo" 
              className="w-16 h-16" 
            />
          </div>
          <h2 className="text-2xl font-bold">Welcome to Flamia</h2>
          <p className="text-muted-foreground mt-2">Sign in to your account or create a new one</p>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-center gap-2 mb-6 text-primary">
            <Mail className="h-5 w-5" />
            <span className="font-medium">Email Authentication</span>
          </div>
          
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              style: {
                button: { 
                  background: 'hsl(142, 70%, 45%)', 
                  color: 'white',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500'
                },
                anchor: { color: 'hsl(142, 70%, 45%)' },
                input: {
                  borderRadius: '6px',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                },
                label: {
                  fontSize: '14px',
                  fontWeight: '500'
                }
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
            redirectTo={`${window.location.origin}/`}
            localization={{
              variables: {
                sign_up: {
                  email_label: 'Email address',
                  password_label: 'Create password (minimum 6 characters)',
                  email_input_placeholder: 'Your email address',
                  password_input_placeholder: 'Create a strong password',
                  button_label: 'Create Account',
                  loading_button_label: 'Creating account...',
                  social_provider_text: 'Sign up with {{provider}}',
                  link_text: "Don't have an account? Sign up",
                  confirmation_text: 'Check your email for the confirmation link'
                },
                sign_in: {
                  email_label: 'Email address',
                  password_label: 'Password',
                  email_input_placeholder: 'Your email address',
                  password_input_placeholder: 'Your password',
                  button_label: 'Sign In',
                  loading_button_label: 'Signing in...',
                  social_provider_text: 'Sign in with {{provider}}',
                  link_text: 'Already have an account? Sign in'
                },
                forgotten_password: {
                  email_label: 'Email address',
                  password_label: 'Password',
                  email_input_placeholder: 'Your email address',
                  button_label: 'Send reset instructions',
                  loading_button_label: 'Sending reset instructions...',
                  link_text: 'Forgot your password?',
                  confirmation_text: 'Check your email for the password reset link'
                }
              },
            }}
          />
        </Card>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Secure authentication powered by Supabase</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
