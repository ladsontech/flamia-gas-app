
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Mail, Phone, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ForgotPasswordProps {
  onBack: () => void;
}

export const ForgotPassword = ({ onBack }: ForgotPasswordProps) => {
  const [resetMethod, setResetMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'input' | 'verify' | 'reset'>('input');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (resetMethod === 'email') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/signin`,
        });

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        } else {
          setStep('verify');
          toast({
            title: "Code Sent",
            description: "Please check your email for the reset code"
          });
        }
      } else {
        // For phone reset, we'll use the SMS verification function
        const { data, error } = await supabase.functions.invoke('send-sms-verification', {
          body: {
            phoneNumber: phoneNumber,
            action: 'send',
            type: 'password_reset'
          }
        });

        if (error) throw error;

        if (data.success) {
          setStep('verify');
          toast({
            title: "Code Sent",
            description: "Please check your phone for the reset code"
          });
        } else {
          throw new Error(data.error || 'Failed to send reset code');
        }
      }
    } catch (error: any) {
      console.error('Error sending reset code:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send reset code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return;

    setLoading(true);

    try {
      if (resetMethod === 'phone') {
        const { data, error } = await supabase.functions.invoke('send-sms-verification', {
          body: {
            phoneNumber: phoneNumber,
            action: 'verify',
            code: otp,
            type: 'password_reset'
          }
        });

        if (error) throw error;

        if (data.success) {
          setStep('reset');
          toast({
            title: "Code Verified",
            description: "Please enter your new password"
          });
        } else {
          throw new Error(data.error || 'Invalid verification code');
        }
      } else {
        // For email, we proceed directly to reset step
        setStep('reset');
      }
    } catch (error: any) {
      console.error('Error verifying code:', error);
      toast({
        title: "Error",
        description: error.message || "Invalid verification code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Password updated successfully"
        });
        onBack();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card border-2 border-accent/20 shadow-xl">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1" />
        </div>
        
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
          Reset Password
        </CardTitle>
        
        {step === 'input' && (
          <div className="flex gap-2 mt-4">
            <Button
              variant={resetMethod === 'email' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setResetMethod('email')}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button
              variant={resetMethod === 'phone' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setResetMethod('phone')}
            >
              <Phone className="w-4 h-4 mr-2" />
              Phone
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {step === 'input' && (
          <form onSubmit={sendResetCode} className="space-y-4">
            {resetMethod === 'email' ? (
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
            ) : (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+256789123456"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Include country code (e.g., +256 for Uganda)
                </p>
              </div>
            )}
            
            <Button type="submit" className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent text-white" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                "Send Reset Code"
              )}
            </Button>
          </form>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <Shield className="h-12 w-12 mx-auto mb-2 text-accent" />
              <h3 className="text-lg font-semibold">Enter Verification Code</h3>
              <p className="text-sm text-muted-foreground">
                Code sent to {resetMethod === 'email' ? email : phoneNumber}
              </p>
            </div>

            <form onSubmit={verifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              
              <Button type="submit" className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent text-white" disabled={loading || otp.length !== 6}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>
            </form>
          </div>
        )}

        {step === 'reset' && (
          <form onSubmit={resetPassword} className="space-y-4">
            <div className="text-center mb-4">
              <Shield className="h-12 w-12 mx-auto mb-2 text-accent" />
              <h3 className="text-lg font-semibold">Create New Password</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent text-white" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
