
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Phone, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const PhoneSignIn = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // If it starts with 0, replace with +256 (Uganda)
    if (cleaned.startsWith('0')) {
      return '+256' + cleaned.slice(1);
    }
    
    // If it doesn't start with +, add +256
    if (!cleaned.startsWith('256') && !phone.startsWith('+')) {
      return '+256' + cleaned;
    }
    
    // If it starts with 256, add +
    if (cleaned.startsWith('256') && !phone.startsWith('+')) {
      return '+' + cleaned;
    }
    
    return phone;
  };

  const extractNameFromPhone = (phone: string) => {
    // For phone numbers, we can't extract meaningful names
    // So we'll use a generic format or ask user to provide name
    const cleaned = phone.replace(/\D/g, '');
    const lastFour = cleaned.slice(-4);
    return `User ${lastFour}`;
  };

  const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    
    setLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      const { data, error } = await supabase.functions.invoke('send-sms-verification', {
        body: {
          phoneNumber: formattedPhone,
          action: 'verify',
          code: otp
        }
      });

      if (error) throw error;

      if (data.success) {
        // For phone verification, we need to create or sign in the user
        // Since Supabase doesn't natively support phone auth without magic links,
        // we'll need to handle this differently
        
        const displayName = fullName || extractNameFromPhone(formattedPhone);
        
        toast({
          title: "Phone Verified",
          description: `Welcome, ${displayName}!`
        });
        
        // Store phone verification status locally for now
        localStorage.setItem('phoneVerified', formattedPhone);
        localStorage.setItem('userName', displayName);
        
        navigate('/');
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

        <form onSubmit={verifyOTP} className="space-y-4">
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
                Verifying...
              </>
            ) : (
              "Verify & Sign In"
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
        <h3 className="text-lg font-semibold">Sign In with Phone</h3>
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
            required={isSignUp}
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

        <Alert>
          <AlertDescription>
            {fullName ? (
              <>Your display name will be: <strong>{fullName}</strong></>
            ) : (
              <>Your display name will be: <strong>{extractNameFromPhone(phoneNumber)}</strong></>
            )}
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
