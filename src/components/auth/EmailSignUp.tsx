
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const EmailSignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
          description: "We've sent you a confirmation link to complete your registration.",
          className: "border-accent/20"
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
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-gradient-to-r from-accent/10 to-accent/5 rounded-full">
            <Mail className="h-12 w-12 text-accent" />
          </div>
        </div>
        <h3 className="text-lg font-semibold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
          Check Your Email
        </h3>
        <Alert className="border-accent/20 bg-accent/5">
          <AlertDescription className="text-center">
            We've sent a confirmation link to <strong className="text-accent">{email}</strong>. 
            Please check your email and click the link to complete your registration.
            You'll be automatically signed in after confirmation.
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          className="hover:bg-accent/10 hover:border-accent/50"
          onClick={() => {
            setConfirmationSent(false);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
          }}
        >
          Try Different Email
        </Button>
      </div>
    );
  }

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

        <Alert className="border-accent/20 bg-accent/5">
          <User className="h-4 w-4 text-accent" />
          <AlertDescription>
            Your display name will be automatically set as: <strong className="text-accent">{extractNameFromEmail(email)}</strong>
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
