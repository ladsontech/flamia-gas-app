import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EmailSignInOnly } from "@/components/auth/EmailSignInOnly";
import { PhoneSignInOnly } from "@/components/auth/PhoneSignInOnly";
import { LionFlameLogo } from "@/components/ui/LionFlameLogo";
import { supabase } from "@/integrations/supabase/client";

const SignIn = () => {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated and redirect to account
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate('/account');
        return;
      }
      
      // Also check for phone verification
      const phoneVerified = localStorage.getItem('phoneVerified');
      if (phoneVerified) {
        navigate('/account');
      }
    };
    
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-accent/10 via-background to-accent/5 p-4">
      <div className="w-full max-w-md mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6 hover:bg-accent/10" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/images/icon.png" 
              alt="Flamia Logo" 
              className="w-16 h-16 animate-pulse" 
            />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h2>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <Card className="glass-card border-2 border-accent/20 shadow-xl backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-xl bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
              Sign In
            </CardTitle>
            {/* Phone signin option hidden for now - keeping code for later use */}
            {false && (
              <div className="flex gap-2 mt-6">
                <Button
                  variant={authMethod === 'email' ? 'default' : 'outline'}
                  className={`flex-1 transition-all duration-200 ${
                    authMethod === 'email' 
                      ? 'bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent text-white border-accent' 
                      : 'hover:bg-accent/10 hover:border-accent/50'
                  }`}
                  onClick={() => setAuthMethod('email')}
                >
                  Email
                </Button>
                <Button
                  variant={authMethod === 'phone' ? 'default' : 'outline'}
                  className={`flex-1 transition-all duration-200 ${
                    authMethod === 'phone' 
                      ? 'bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent text-white border-accent' 
                      : 'hover:bg-accent/10 hover:border-accent/50'
                  }`}
                  onClick={() => setAuthMethod('phone')}
                >
                  Phone
                </Button>
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            <div className="mb-4 flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full hover:bg-accent/10 border-accent/30"
                onClick={async () => {
                  await supabase.auth.signInWithOAuth({ 
                    provider: 'google', 
                    options: { 
                      redirectTo: `${window.location.origin}/account`
                    }
                  });
                }}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </div>
            
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-accent/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>
            
            {/* Always show email signin, phone signin code kept but hidden */}
            <EmailSignInOnly />
            {false && authMethod === 'phone' && <PhoneSignInOnly />}
          </CardContent>
          
          <div className="px-6 pb-6">
            <div className="text-center pt-4 border-t border-accent/20">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-accent hover:text-accent/80 font-semibold"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </Button>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
