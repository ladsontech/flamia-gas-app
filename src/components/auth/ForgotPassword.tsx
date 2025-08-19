import { useState, useEffect } from "react";
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
  const [step, setStep] = useState<'input' | 'verify' | 'reset' | 'email_sent'>('input');
  const [loading, setLoading] = useState(false);
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState('');
  const { toast } = useToast();

  // Check if we're coming back from an email link
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const type = hashParams.get('type');
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');

    console.log('URL hash params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type, error, errorDescription });

    if (error) {
      let errorMessage = "The reset link is invalid or has expired. Please request a new one.";
      
      if (error === 'access_denied' && errorDescription?.includes('otp_expired')) {
        errorMessage = "The reset link has expired. Please request a new password reset email.";
      }
      
      toast({
        title: "Reset Link Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Clear the error from URL and redirect back to initial state
      window.history.replaceState(null, '', window.location.pathname);
      setStep('input');
      return;
    }

    if (accessToken && refreshToken && type === 'recovery') {
      console.log('Valid recovery tokens found, setting session...');
      
      // Set the session with the tokens
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      }).then(({ error }) => {
        if (error) {
          console.error('Session error:', error);
          toast({
            title: "Session Error",
            description: "Failed to authenticate. Please try requesting a new reset link.",
            variant: "destructive"
          });
          setStep('input');
        } else {
          console.log('Session set successfully, proceeding to reset step');
          setStep('reset');
          toast({
            title: "Email Verified",
            description: "You can now set your new password"
          });
        }
        // Clear the tokens from URL
        window.history.replaceState(null, '', window.location.pathname);
      });
    }
  }, [toast]);

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
      return '+256' + cleaned.slice(1);
    }
    
    if (!cleaned.startsWith('256') && !phone.startsWith('+')) {
      return '+256' + cleaned;
    }
    
    if (cleaned.startsWith('256') && !phone.startsWith('+')) {
      return '+' + cleaned;
    }
    
    return phone;
  };

  const sendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (resetMethod === 'email') {
        // For email reset, use a more reliable redirect URL
        const redirectUrl = `${window.location.origin}${window.location.pathname}#reset`;
        console.log('Sending email reset to:', email, 'with redirect:', redirectUrl);
        
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        });

        if (error) {
          console.error('Email reset error:', error);
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        } else {
          setStep('email_sent');
          toast({
            title: "Reset Email Sent",
            description: "Please check your email and click the reset link. The link is valid for 1 hour."
          });
        }
      } else {
        // Format and validate phone number
        const formattedPhone = formatPhoneNumber(phoneNumber);
        
        if (!formattedPhone.startsWith('+')) {
          toast({
            title: "Invalid Phone Number",
            description: "Please enter a valid phone number with country code (e.g., +256789123456) or local format (0789123456)",
            variant: "destructive"
          });
          return;
        }

        console.log('Sending SMS reset to:', formattedPhone);
        
        const { data, error } = await supabase.functions.invoke('send-sms-verification', {
          body: {
            phoneNumber: formattedPhone,
            action: 'send',
            type: 'password_reset'
          }
        });

        if (error) {
          console.error('SMS function error:', error);
          throw error;
        }

        if (data.success) {
          setPhoneNumber(formattedPhone); // Store the formatted number
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
      console.log('Verifying SMS code for:', phoneNumber);
      
      const { data, error } = await supabase.functions.invoke('send-sms-verification', {
        body: {
          phoneNumber: phoneNumber,
          action: 'verify',
          code: otp,
          type: 'password_reset'
        }
      });

      if (error) {
        console.error('SMS verify function error:', error);
        throw error;
      }

      if (data.success) {
        setVerifiedPhoneNumber(phoneNumber); // Store verified phone number
        setStep('reset');
        toast({
          title: "Code Verified",
          description: "Please enter your new password"
        });
      } else {
        throw new Error(data.error || 'Invalid verification code');
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
      if (resetMethod === 'email') {
        // For email users, use Supabase's built-in password update
        console.log('Updating user password via Supabase auth...');
        
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (error) {
          console.error('Password update error:', error);
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        } else {
          console.log('Password updated successfully');
          toast({
            title: "Success",
            description: "Password updated successfully"
          });
          onBack();
        }
      } else {
        // For phone users, update password in the profiles table
        console.log('Updating password for phone user:', verifiedPhoneNumber);
        
        const { error } = await supabase
          .from('profiles')
          .update({ password_hash: newPassword }) // Note: In production, hash the password
          .eq('phone_number', verifiedPhoneNumber);

        if (error) {
          console.error('Phone user password update error:', error);
          toast({
            title: "Error",
            description: "Failed to update password. Please try again.",
            variant: "destructive"
          });
        } else {
          console.log('Password updated successfully for phone user');
          toast({
            title: "Success",
            description: "Password updated successfully"
          });
          onBack();
        }
      }
    } catch (error: any) {
      console.error('Password update error:', error);
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
                  placeholder="+256789123456 or 0789123456"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Include country code (+256 for Uganda) or use local format (0789123456)
                </p>
              </div>
            )}
            
            <Button type="submit" className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent text-white" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                `Send Reset ${resetMethod === 'email' ? 'Link' : 'Code'}`
              )}
            </Button>
          </form>
        )}

        {step === 'email_sent' && (
          <div className="space-y-4 text-center">
            <div className="mb-4">
              <Mail className="h-12 w-12 mx-auto mb-2 text-accent" />
              <h3 className="text-lg font-semibold">Check Your Email</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to {email}
              </p>
            </div>
            
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Click the link in your email to reset your password. The link will expire in 1 hour.
                If you don't see the email, check your spam folder.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => setStep('input')}
                className="w-full"
              >
                Try Different Method
              </Button>
              <Button
                variant="ghost"
                onClick={sendResetCode}
                disabled={loading}
                className="w-full text-sm"
              >
                Resend Email
              </Button>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <Shield className="h-12 w-12 mx-auto mb-2 text-accent" />
              <h3 className="text-lg font-semibold">Enter Verification Code</h3>
              <p className="text-sm text-muted-foreground">
                Code sent to {phoneNumber}
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

              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep('input')}
                className="w-full text-sm"
              >
                Back to Phone Number
              </Button>
            </form>
          </div>
        )}

        {step === 'reset' && (
          <form onSubmit={resetPassword} className="space-y-4">
            <div className="text-center mb-4">
              <Shield className="h-12 w-12 mx-auto mb-2 text-accent" />
              <h3 className="text-lg font-semibold">Create New Password</h3>
              {resetMethod === 'phone' && (
                <p className="text-sm text-muted-foreground mt-2">
                  For phone number: {verifiedPhoneNumber}
                </p>
              )}
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
