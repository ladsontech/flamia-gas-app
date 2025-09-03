import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Lock, User, Gift } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const EmailSignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Auto-fill referral code from URL parameter
    const refParam = searchParams.get('ref');
    if (refParam) {
      setReferralCode(refParam);
    }
  }, [searchParams]);

  const extractNameFromEmail = (email: string) => {
    const localPart = email.split('@')[0];
    const name = localPart.replace(/[._-]/g, ' ');
    return name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const displayName = extractNameFromEmail(email);

      // Create user account
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName,
            display_name: displayName
          }
        }
      });

      if (error) {
        toast({
          title: "Sign Up Failed", 
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      if (authData.user) {
        // Handle referral code if provided
        if (referralCode.trim()) {
          try {
            // Find the referrer by referral code
            const { data: referrerProfile } = await supabase
              .from('profiles')
              .select('id')
              .eq('referral_code', referralCode.trim().toUpperCase())
              .single();

            if (referrerProfile) {
              // Create referral record
              await supabase
                .from('referrals')
                .insert({
                  referrer_id: referrerProfile.id,
                  referred_user_id: authData.user.id,
                  referral_code: referralCode.trim().toUpperCase(),
                  status: 'pending'
                });

              toast({
                title: "Account Created Successfully",
                description: "Welcome to Flamia! Referral code applied successfully.",
                className: "border-accent/20"
              });
            } else {
              toast({
                title: "Account Created Successfully",
                description: "Welcome to Flamia! Invalid referral code was ignored.",
                className: "border-accent/20"
              });
            }
          } catch (referralError) {
            console.error('Error processing referral:', referralError);
            // Continue with signup even if referral fails
            toast({
              title: "Account Created Successfully",
              description: "Welcome to Flamia! There was an issue with the referral code.",
              className: "border-accent/20"
            });
          }
        } else {
          toast({
            title: "Account Created Successfully",
            description: "Welcome to Flamia! You're now signed in.",
            className: "border-accent/20"
          });
        }

        // Navigate to home page since user is automatically signed in
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSignUp} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 border-accent/20 focus:border-accent focus:ring-accent/20"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 border-accent/20 focus:border-accent focus:ring-accent/20"
              required
              minLength={6}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 border-accent/20 focus:border-accent focus:ring-accent/20"
              required
              minLength={6}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="referralCode" className="text-sm font-medium text-foreground">
            Referral Code (Optional)
          </Label>
          <div className="relative">
            <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="referralCode"
              type="text"
              placeholder="Enter referral code"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              className="pl-10 border-accent/20 focus:border-accent focus:ring-accent/20"
            />
          </div>
        </div>

        <Alert className="border-accent/20 bg-accent/5">
          <User className="h-4 w-4 text-accent" />
          <AlertDescription>
            Your display name will be automatically set as: <strong className="text-accent">{extractNameFromEmail(email)}</strong>
            {referralCode && (
              <>
                <br />
                <span className="text-green-600">Referral code applied: <strong>{referralCode}</strong></span>
              </>
            )}
          </AlertDescription>
        </Alert>
        
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </div>
  );
};