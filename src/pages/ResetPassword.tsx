
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { LionFlameLogo } from "@/components/ui/LionFlameLogo";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasValidTokens, setHasValidTokens] = useState(false);
  const [isCheckingTokens, setIsCheckingTokens] = useState(true);
  const [mode, setMode] = useState<'request' | 'reset'>('request');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokens = async () => {
      // Check if we have the necessary URL parameters for password reset
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        try {
          // Set the session from the URL parameters
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (!error) {
            setHasValidTokens(true);
            setMode('reset');
          } else {
            console.error('Session error:', error);
            toast.error("Invalid reset link. Please request a new password reset.");
            setMode('request');
          }
        } catch (error) {
          console.error('Token validation error:', error);
          toast.error("Invalid reset link. Please request a new password reset.");
          setMode('request');
        }
      } else {
        // No tokens present, show the request form
        setMode('request');
      }
      
      setIsCheckingTokens(false);
    };

    checkTokens();
  }, [searchParams]);

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password reset email sent! Check your inbox.");
        setIsSuccess(true);
      }
    } catch (error) {
      console.error('Reset email error:', error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error("Please fill in both password fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast.error(error.message);
      } else {
        setIsSuccess(true);
        toast.success("Password updated successfully!");
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking tokens
  if (isCheckingTokens) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-accent/10 via-background to-accent/5 p-4">
        <div className="w-full max-w-md mx-auto flex items-center justify-center min-h-screen">
          <Card className="glass-card border-2 border-accent/20 shadow-xl backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <LionFlameLogo size={64} className="animate-pulse" />
                </div>
                <p className="text-muted-foreground">Verifying reset link...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Success state for both email sent and password reset
  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-accent/10 via-background to-accent/5 p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <LionFlameLogo size={64} className="animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent mb-2">
              {mode === 'reset' ? 'Password Reset Successful' : 'Email Sent'}
            </h2>
          </div>

          <Card className="glass-card border-2 border-accent/20 shadow-xl backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold">
                  {mode === 'reset' ? 'All Done!' : 'Check Your Email!'}
                </h3>
                <p className="text-muted-foreground">
                  {mode === 'reset' 
                    ? 'Your password has been successfully updated. You can now sign in with your new password.'
                    : 'We\'ve sent a password reset link to your email address. Click the link to reset your password.'
                  }
                </p>
                <Button 
                  onClick={() => navigate('/signin')}
                  className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent"
                >
                  Continue to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-accent/10 via-background to-accent/5 p-4">
      <div className="w-full max-w-md mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6 hover:bg-accent/10" 
          onClick={() => navigate('/signin')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sign In
        </Button>
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <LionFlameLogo size={64} className="animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent mb-2">
            {mode === 'reset' ? 'Reset Your Password' : 'Forgot Password'}
          </h2>
          <p className="text-muted-foreground">
            {mode === 'reset' 
              ? 'Enter your new password below' 
              : 'Enter your email address and we\'ll send you a link to reset your password'
            }
          </p>
        </div>

        <Card className="glass-card border-2 border-accent/20 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-xl bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
              {mode === 'reset' ? 'New Password' : 'Reset Password'}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {mode === 'request' ? (
              <form onSubmit={handleSendResetEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Email"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
