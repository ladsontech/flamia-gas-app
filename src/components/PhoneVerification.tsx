
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Phone, Shield } from "lucide-react";

interface PhoneVerificationProps {
  onVerificationComplete: (phoneNumber: string) => void;
  onCancel: () => void;
}

export const PhoneVerification = ({ onVerificationComplete, onCancel }: PhoneVerificationProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !name) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-sms-verification', {
        body: {
          phoneNumber: phoneNumber,
          action: 'send'
        }
      });

      if (error) throw error;

      if (data.success) {
        setIsCodeSent(true);
        toast({
          title: "Code Sent",
          description: "Please check your phone for the verification code",
        });
      } else {
        throw new Error(data.error || 'Failed to send verification code');
      }
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code",
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
      const { data, error } = await supabase.functions.invoke('send-sms-verification', {
        body: {
          phoneNumber: phoneNumber,
          action: 'verify',
          code: otp
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success",
          description: "Phone number verified successfully",
        });
        onVerificationComplete(phoneNumber);
      } else {
        throw new Error(data.error || 'Verification failed');
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

  const resetForm = () => {
    setIsCodeSent(false);
    setOtp('');
    setPhoneNumber('');
    setName('');
  };

  if (!isCodeSent) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <Phone className="h-12 w-12 mx-auto mb-2 text-primary" />
          <h3 className="text-lg font-semibold">Verify Your Phone Number</h3>
          <p className="text-sm text-muted-foreground">
            We'll send you a verification code via SMS
          </p>
        </div>

        <form onSubmit={sendVerificationCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
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
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full" 
            onClick={onCancel}
          >
            Cancel
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <Shield className="h-12 w-12 mx-auto mb-2 text-primary" />
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
          <p className="text-xs text-muted-foreground text-center">
            Enter the 6-digit code sent to your phone
          </p>
        </div>
        
        <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
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
          variant="outline" 
          className="w-full" 
          onClick={resetForm}
        >
          Use Different Number
        </Button>
      </form>
    </div>
  );
};
