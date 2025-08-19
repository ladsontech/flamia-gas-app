
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Phone, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const PhoneSignUp = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name",
        variant: "destructive"
      });
      return;
    }

    if (!password.trim() || password.length < 6) {
      toast({
        title: "Password Required",
        description: "Please enter a password with at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      const { data, error } = await supabase.functions.invoke('send-sms-verification', {
        body: {
          phoneNumber: formattedPhone,
          action: 'send'
        }
      });

      if (error) throw error;

      if (data.success) {
        setOtpSent(true);
        toast({
          title: "Code Sent",
          description: `Verification code sent to ${formattedPhone}`
        });
      } else {
        throw new Error(data.error || 'Failed to send verification code');
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTPAndSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    
    setLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      // First verify the OTP
      const { data, error } = await supabase.functions.invoke('send-sms-verification', {
        body: {
          phoneNumber: formattedPhone,
          action: 'verify',
          code: otp
        }
      });

      if (error) throw error;

      if (data.success) {
        // Create user account with phone number as email (workaround)
        const emailFromPhone = `${formattedPhone.replace('+', '')}@phone.local`;
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: emailFromPhone,
          password: password,
          options: {
            data: {
              display_name: fullName,
              full_name: fullName,
              phone_number: formattedPhone
            }
          }
        });

        if (signUpError) throw signUpError;

        if (signUpData.user) {
          // Update the profile with phone number
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: signUpData.user.id,
              phone_number: formattedPhone,
              full_name: fullName,
              display_name: fullName
            });

          if (profileError) {
            console.error('Profile update error:', profileError);
          }

          toast({
            title: "Account Created Successfully",
            description: `Welcome, ${fullName}! Your account has been created.`
          });
          
          navigate('/account');
        }
      } else {
        throw new Error(data.error || 'Verification failed');
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Error",
        description: error.message || "Invalid verification code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOtpSent(false);
    setOtp('');
    setPhoneNumber('');
    setFullName('');
    setPassword('');
  };

  if (otpSent) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <Shield className="h-12 w-12 mx-auto mb-2 text-primary" />
          <h3 className="text-lg font-semibold">Enter Verification Code</h3>
          <p className="text-sm text-muted-foreground">
            Code sent to {formatPhoneNumber(phoneNumber)}
          </p>
        </div>

        <form onSubmit={verifyOTPAndSignUp} className="space-y-4">
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
          
          <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Verify & Create Account"
            )}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full" 
            onClick={resetForm}
          >
            Use Different Number
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <Phone className="h-12 w-12 mx-auto mb-2 text-primary" />
        <h3 className="text-lg font-semibold">Sign Up with Phone</h3>
        <p className="text-sm text-muted-foreground">
          We'll send you a verification code via SMS
        </p>
      </div>

      <form onSubmit={sendOTP} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        
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
            Uganda numbers: +256 or start with 0
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter a secure password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Minimum 6 characters
          </p>
        </div>

        <Alert>
          <AlertDescription>
            Your display name will be: <strong>{fullName || 'Enter your name above'}</strong>
          </AlertDescription>
        </Alert>
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Code...
            </>
          ) : (
            "Send Verification Code"
          )}
        </Button>
      </form>
    </div>
  );
};
