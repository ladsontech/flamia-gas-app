import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();

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
          />
        </div>
      </div>
    </div>
  );
};

export default Login;