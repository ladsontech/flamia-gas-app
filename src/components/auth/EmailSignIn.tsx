
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const EmailSignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const extractNameFromEmail = (email: string) => {
    const localPart = email.split('@')[0];
    const name = localPart.replace(/[._-]/g, ' ');
    return name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in."
        });
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const displayName = extractNameFromEmail(email);
      const redirectUrl = `${window.location.origin}/`;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
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
      } else {
        setConfirmationSent(true);
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your registration."
        });
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

  if (confirmationSent) {
    return (
      <div className="text-center space-y-4">
        <Mail className="h-12 w-12 mx-auto text-primary" />
        <h3 className="text-lg font-semibold">Check Your Email</h3>
        <Alert>
          <AlertDescription>
            We've sent a confirmation link to <strong>{email}</strong>. 
            Please check your email and click the link to complete your registration.
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={() => {
            setConfirmationSent(false);
            setEmail('');
            setPassword('');
          }}
        >
          Try Different Email
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder={isSignUp ? "Create a strong password (min 6 characters)" : "Enter your password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        {isSignUp && (
          <Alert>
            <AlertDescription>
              Your display name will be automatically set as: <strong>{extractNameFromEmail(email)}</strong>
            </AlertDescription>
          </Alert>
        )}
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isSignUp ? "Creating Account..." : "Signing In..."}
            </>
          ) : (
            isSignUp ? "Create Account" : "Sign In"
          )}
        </Button>
      </form>

      <div className="text-center">
        <Button
          type="button"
          variant="link"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm"
        >
          {isSignUp 
            ? "Already have an account? Sign in" 
            : "Don't have an account? Create one"
          }
        </Button>
      </div>
    </div>
  );
};
