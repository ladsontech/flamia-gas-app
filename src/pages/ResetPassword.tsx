
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasValidTokens, setHasValidTokens] = useState(false);
  const [isCheckingTokens, setIsCheckingTokens] = useState(true);
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
          } else {
            console.error('Session error:', error);
            toast.error("Invalid reset link. Please request a new password reset.");
          }
        } catch (error) {
          console.error('Token validation error:', error);
          toast.error("Invalid reset link. Please request a new password reset.");
        }
      } else {
        toast.error("Invalid reset link. Please request a new password reset from the sign in page.");
      }
      
      setIsCheckingTokens(false);
    };

    checkTokens();
  }, [searchParams]);

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

  // Show error state if no valid tokens
  if (!hasValidTokens) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-accent/10 via-background to-accent/5 p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <LionFlameLogo size={64} className="animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent mb-2">
              Invalid Reset Link
            </h2>
          </div>

          <Card className="glass-card border-2 border-accent/20 shadow-xl backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  This password reset link is invalid or has expired. Please request a new password reset from the sign in page.
                </p>
                <Button 
                  onClick={() => navigate('/signin')}
                  className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent"
                >
                  Go to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-accent/10 via-background to-accent/5 p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <LionFlameLogo size={64} className="animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent mb-2">
              Password Reset Successful
            </h2>
          </div>

          <Card className="glass-card border-2 border-accent/20 shadow-xl backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold">All Done!</h3>
                <p className="text-muted-foreground">
                  Your password has been successfully updated. You can now sign in with your new password.
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
            Reset Your Password
          </h2>
          <p className="text-muted-foreground">Enter your new password below</p>
        </div>

        <Card className="glass-card border-2 border-accent/20 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-xl bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
              New Password
            </CardTitle>
          </CardHeader>
          
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
