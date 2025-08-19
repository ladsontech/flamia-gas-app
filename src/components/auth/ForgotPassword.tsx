import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import bcrypt from "bcryptjs";

interface ForgotPasswordProps {
  onBack: () => void;
}

function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [identifier, setIdentifier] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"identifier" | "verify" | "reset">("identifier");
  const [isLoading, setIsLoading] = useState(false);
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState<string | null>(null);
  const [isPhoneReset, setIsPhoneReset] = useState(false);

  useEffect(() => {
    const savedPhoneNumber = localStorage.getItem('verified_phone_number');
    if (savedPhoneNumber) {
      setVerifiedPhoneNumber(savedPhoneNumber);
      setIsPhoneReset(true);
    }
  }, []);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const formatPhoneNumber = (phone: string) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '256' + cleaned.substring(1);
    } else if (!cleaned.startsWith('256')) {
      cleaned = '256' + cleaned;
    }
    return '+' + cleaned;
  };

  const handleSendCode = async () => {
    if (!identifier) {
      toast.error("Please enter your email or phone number");
      return;
    }

    setIsLoading(true);
    
    try {
      if (isValidEmail(identifier)) {
        setIsPhoneReset(false);
        const { error } = await supabase.auth.resetPasswordForEmail(identifier, {
          redirectTo: `${window.location.origin}/signin`,
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Password reset email sent! Check your inbox.");
          onBack();
        }
      } else if (isValidPhone(identifier)) {
        setIsPhoneReset(true);
        const formattedPhone = formatPhoneNumber(identifier);
        
        const { data: profiles } = await supabase
          .from('profiles')
          .select('phone_number')
          .eq('phone_number', formattedPhone)
          .single();

        if (!profiles) {
          toast.error("No account found with this phone number");
          return;
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        const response = await fetch('/api/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: formattedPhone,
            message: `Your Flamia password reset code is: ${code}. This code expires in 10 minutes.`
          })
        });

        if (!response.ok) {
          toast.error("Failed to send SMS. Please try again.");
          return;
        }

        localStorage.setItem('reset_code', code);
        localStorage.setItem('reset_code_expiry', (Date.now() + 10 * 60 * 1000).toString());
        localStorage.setItem('reset_phone', formattedPhone);
        
        setStep("verify");
        toast.success("Verification code sent to your phone");
      } else {
        toast.error("Please enter a valid email or phone number");
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      toast.error("Please enter the verification code");
      return;
    }

    const savedCode = localStorage.getItem('reset_code');
    const expiry = localStorage.getItem('reset_code_expiry');
    const resetPhone = localStorage.getItem('reset_phone');

    if (!savedCode || !expiry || !resetPhone) {
      toast.error("Session expired. Please start over.");
      setStep("identifier");
      return;
    }

    if (Date.now() > parseInt(expiry)) {
      toast.error("Verification code has expired. Please request a new one.");
      localStorage.removeItem('reset_code');
      localStorage.removeItem('reset_code_expiry');
      localStorage.removeItem('reset_phone');
      setStep("identifier");
      return;
    }

    if (verificationCode !== savedCode) {
      toast.error("Invalid verification code");
      return;
    }

    setVerifiedPhoneNumber(resetPhone);
    localStorage.setItem('verified_phone_number', resetPhone);
    localStorage.removeItem('reset_code');
    localStorage.removeItem('reset_code_expiry');
    localStorage.removeItem('reset_phone');
    
    setStep("reset");
    toast.success("Phone verified! You can now reset your password.");
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (!verifiedPhoneNumber) {
      toast.error("Phone number not verified");
      return;
    }

    setIsLoading(true);

    try {
      if (isPhoneReset) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const { error } = await supabase
          .from('profiles')
          .update({ 
            password_hash: hashedPassword
          })
          .eq('phone_number', verifiedPhoneNumber);

        if (error) {
          console.error('Database update error:', error);
          toast.error("Failed to update password. Please try again.");
          return;
        }

        localStorage.removeItem('verified_phone_number');
        toast.success("Password updated successfully!");
        onBack();
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Reset Password</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "identifier" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or Phone Number</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="Enter your email or phone number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleSendCode} 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Code"}
            </Button>
          </>
        )}

        {step === "verify" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter the 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>
            <Button 
              onClick={handleVerifyCode} 
              className="w-full"
              disabled={isLoading}
            >
              Verify Code
            </Button>
          </>
        )}

        {step === "reset" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
              />
            </div>
            <Button 
              onClick={handleResetPassword} 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </>
        )}

        <Button 
          variant="outline" 
          onClick={onBack} 
          className="w-full"
        >
          Back to Sign In
        </Button>
      </CardContent>
    </Card>
  );
}

export default ForgotPassword;
