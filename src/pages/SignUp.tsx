import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LionFlameLogo } from "@/components/ui/LionFlameLogo";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SignUp = () => {
  const [referralCode, setReferralCode] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    // Auto-fill referral code from URL parameter
    const refParam = searchParams.get('ref');
    if (refParam) {
      setReferralCode(refParam);
    }
  }, [searchParams]);

  const handleGoogleSignUp = async () => {
    // Store referral code in localStorage temporarily
    if (referralCode.trim()) {
      localStorage.setItem('tempReferralCode', referralCode.trim().toUpperCase());
    }
    
    await supabase.auth.signInWithOAuth({ 
      provider: 'google', 
      options: { 
        redirectTo: `${window.location.origin}/`
      } 
    });
  };

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
            <LionFlameLogo size={64} className="animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent mb-2">
            Join Flamia
          </h2>
          <p className="text-muted-foreground">Create your account to get started</p>
        </div>

        <Card className="glass-card border-2 border-accent/20 shadow-xl backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-xl bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
              Create Account with Google
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="text-center mb-6">
              <p className="text-muted-foreground text-sm mb-4">
                Create your account using your Google account
              </p>
              
              {referralCode && (
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-accent">
                    Referral Code: {referralCode}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You'll earn rewards when you complete your first order!
                  </p>
                </div>
              )}
            </div>
            
            <Button
              variant="default"
              className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 mb-4"
              onClick={handleGoogleSignUp}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
            
            {!referralCode && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">
                  Have a referral code?
                </p>
                <input
                  type="text"
                  placeholder="Enter referral code"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-sm border border-accent/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>
            )}
          </CardContent>
          
          <div className="px-6 pb-6">
            <div className="text-center pt-4 border-t border-accent/20">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-accent hover:text-accent/80 font-semibold"
                  onClick={() => navigate('/signin')}
                >
                  Sign In
                </Button>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
