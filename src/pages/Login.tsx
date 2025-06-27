import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Lock, UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session) {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
            duration: 3000,
          });
          
          // Check if user has admin role
          if (localStorage.getItem('userRole') === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }
      }
      
      if (event === 'SIGNED_UP') {
        toast({
          title: "Account Created!",
          description: "Welcome to Flamia! Your account has been created successfully.",
          duration: 5000,
        });
      }
      
      if (event === 'PASSWORD_RECOVERY') {
        toast({
          title: "Password Reset",
          description: "Check your email for password reset instructions",
          duration: 5000,
        });
      }
    });

    // Listen for auth errors
    const handleAuthError = (error: any) => {
      if (error?.message) {
        let title = "Authentication Error";
        let description = error.message;
        
        // Handle specific error cases with user-friendly messages
        if (error.message.includes("Invalid login credentials")) {
          title = "Login Failed";
          description = "The email or password you entered is incorrect. Please check your credentials and try again.";
        } else if (error.message.includes("User already registered")) {
          title = "Account Already Exists";
          description = "An account with this email already exists. Please sign in instead or use a different email address.";
        } else if (error.message.includes("Email not confirmed")) {
          title = "Email Not Verified";
          description = "Please check your email and click the verification link before signing in.";
        } else if (error.message.includes("Password should be at least")) {
          title = "Password Too Short";
          description = "Your password must be at least 6 characters long. Please choose a stronger password.";
        } else if (error.message.includes("Unable to validate email address")) {
          title = "Invalid Email";
          description = "Please enter a valid email address.";
        }
        
        toast({
          title,
          description,
          variant: "destructive",
          duration: 5000,
        });
      }
    };

    // Override console.error to catch Supabase auth errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const errorMessage = args.join(' ');
      if (errorMessage.includes('Supabase request failed')) {
        try {
          // Try to parse the error details
          const errorMatch = errorMessage.match(/\{"url".*"body":"(\{.*\})"/);
          if (errorMatch) {
            const bodyStr = errorMatch[1].replace(/\\"/g, '"');
            const errorBody = JSON.parse(bodyStr);
            handleAuthError(errorBody);
          }
        } catch (e) {
          // If parsing fails, show generic error
          handleAuthError({ message: "Authentication failed. Please try again." });
        }
      }
      originalConsoleError.apply(console, args);
    };

    return () => {
      subscription.unsubscribe();
      console.error = originalConsoleError;
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
          
          <div className="mb-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>New users:</strong> Click "Create Account" to sign up.<br />
                <strong>Existing users:</strong> Use "Sign In" with your credentials.
              </AlertDescription>
            </Alert>
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

        <div className="mt-6 space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>Secure authentication powered by Supabase</span>
            </div>
          </div>
          
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Having trouble?</strong><br />
              • Make sure your email and password are correct<br />
              • Use "Forgot your password?" if you can't remember it<br />
              • Check your email for verification links
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default Login;