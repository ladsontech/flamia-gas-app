import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Listen for auth state changes and error messages
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      navigate('/');
    }
    if (event === 'USER_UPDATED') {
      navigate('/');
    }
    if (event === 'SIGNED_OUT') {
      navigate('/login');
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/20 to-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
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
            view="sign_in"
            showLinks={true}
            onError={(error) => {
              // Handle user already exists error
              if (error.message.includes('User already registered')) {
                toast({
                  title: "Account exists",
                  description: "This email is already registered. Please sign in instead.",
                  variant: "destructive",
                });
              } else {
                // Handle other errors
                toast({
                  title: "Error",
                  description: error.message,
                  variant: "destructive",
                });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;