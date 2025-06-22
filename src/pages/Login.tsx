
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Phone, Mail } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session) {
          // Check if user has admin role
          if (localStorage.getItem('userRole') === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isOtpSent) {
        // Send OTP
        const { error } = await supabase.auth.signInWithOtp({
          phone: phoneNumber,
          options: {
            data: {
              name: name
            }
          }
        });

        if (error) throw error;

        setIsOtpSent(true);
        toast({
          title: "OTP Sent",
          description: "Please check your phone for the verification code",
        });
      } else {
        // Verify OTP
        const { error } = await supabase.auth.verifyOtp({
          phone: phoneNumber,
          token: otp,
          type: 'sms'
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Phone number verified successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPhoneAuth = () => {
    setIsOtpSent(false);
    setOtp('');
    setPhoneNumber('');
    setName('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/20 to-background p-4">
      <div className="w-full max-w-md mx-auto">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Welcome to Flamia</h2>
          <p className="text-muted-foreground mt-2">Sign in or create your account</p>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="phone" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="phone" className="mt-6">
              <form onSubmit={handlePhoneAuth} className="space-y-4">
                {!isOtpSent ? (
                  <>
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
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Code sent to {phoneNumber}
                    </p>
                  </div>
                )}
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Processing..." : isOtpSent ? "Verify Code" : "Send Code"}
                </Button>
                
                {isOtpSent && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={resetPhoneAuth}
                  >
                    Use Different Number
                  </Button>
                )}
              </form>
            </TabsContent>
            
            <TabsContent value="email" className="mt-6">
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  style: {
                    button: { background: 'hsl(142, 70%, 45%)', color: 'white' },
                    anchor: { color: 'hsl(142, 70%, 45%)' },
                  },
                  variables: {
                    default: {
                      colors: {
                        brand: 'hsl(142, 70%, 45%)',
                        brandAccent: 'hsl(142, 70%, 40%)',
                      },
                    },
                  },
                }}
                providers={[]}
                localization={{
                  variables: {
                    sign_up: {
                      password_label: 'Password (minimum 6 characters)',
                      password_input_placeholder: 'Enter a strong password (min. 6 characters)',
                    },
                  },
                }}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Login;
