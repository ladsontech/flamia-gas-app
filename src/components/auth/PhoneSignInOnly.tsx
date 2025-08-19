
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Phone, Shield } from "lucide-react";

export const PhoneSignInOnly = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
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
    setLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      // Check if user exists with this phone number
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone_number', formattedPhone)
        .single();

      if (!existingProfile) {
        toast({
          title: "Account Not Found",
          description: "No account found with this phone number. Please sign up first.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
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

  const verifyOTPAndSignIn = async (e: React.FormEvent) => {
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
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('phone_number', formattedPhone)
          .single();

        toast({
          title: "Welcome back!",
          description: `Successfully signed in as ${profile?.display_name || 'User'}`
        });
        
        // Store phone verification status locally
        localStorage.setItem('phoneVerified', formattedPhone);
        localStorage.setItem('userName', profile?.display_name || profile?.full_name || 'User');
        
        navigate('/account');
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

        <form onSubmit={verifyOTPAndSignIn} className="space-y-4">
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
                Signing In...
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
          Enter your registered phone number
        </p>
      </div>

      <form onSubmit={sendOTP} className="space-y-4">
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
