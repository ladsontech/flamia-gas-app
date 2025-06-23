
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Phone, Mail } from "lucide-react";
import { PhoneVerification } from "@/components/PhoneVerification";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);

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

  const handlePhoneVerificationComplete = async (phoneNumber: string) => {
    try {
      // Create a temporary email based on phone number for Supabase auth
      const tempEmail = `${phoneNumber.replace(/[^0-9]/g, '')}@temp.flamia.com`;
      const tempPassword = Math.random().toString(36).substring(2, 15);
      
      // Sign up the user with temporary email and password
      const { error } = await supabase.auth.signUp({
        email: tempEmail,
        password: tempPassword,
        options: {
          data: {
            phone: phoneNumber,
            phone_verified: true
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Account created successfully with verified phone number",
      });
      
      setShowPhoneVerification(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/20 to-background p-4">
      <div className="w-full max-w-md mx-auto">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => {
            if (showPhoneVerification) {
              setShowPhoneVerification(false);
            } else {
              navigate('/');
            }
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {showPhoneVerification ? 'Back to Login' : 'Back to Home'}
        </Button>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Welcome to Flamia</h2>
          <p className="text-muted-foreground mt-2">Sign in or create your account</p>
        </div>

        <Card className="p-6">
          {showPhoneVerification ? (
            <PhoneVerification
              onVerificationComplete={handlePhoneVerificationComplete}
              onCancel={() => setShowPhoneVerification(false)}
            />
          ) : (
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
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Sign up or sign in with your phone number
                  </p>
                  <Button 
                    onClick={() => setShowPhoneVerification(true)}
                    className="w-full"
                  >
                    Continue with Phone Number
                  </Button>
                </div>
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
          )}
        </Card>
      </div>
    </div>
  );
};

export default Login;
