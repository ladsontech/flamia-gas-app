import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EmailSignUp } from "@/components/auth/EmailSignUp";
import { PhoneSignUp } from "@/components/auth/PhoneSignUp";
import { LionFlameLogo } from "@/components/ui/LionFlameLogo";

const SignUp = () => {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-accent/10 via-background to-accent/5 p-4">
      <div className="w-full max-w-md mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6 hover:bg-accent/10" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <LionFlameLogo size={64} className="animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent mb-2">
            Join Flamia
          </h2>
          <p className="text-muted-foreground">Create your account to get started</p>
        </div>

        <Card className="glass-card border-2 border-accent/20 shadow-xl backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-xl bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
              Create Account
            </CardTitle>
            {/* Phone signup option hidden for now - keeping code for later use */}
            {false && (
              <div className="flex gap-2 mt-6">
                <Button
                  variant={authMethod === 'email' ? 'default' : 'outline'}
                  className={`flex-1 transition-all duration-200 ${
                    authMethod === 'email' 
                      ? 'bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent text-white border-accent' 
                      : 'hover:bg-accent/10 hover:border-accent/50'
                  }`}
                  onClick={() => setAuthMethod('email')}
                >
                  Email
                </Button>
                <Button
                  variant={authMethod === 'phone' ? 'default' : 'outline'}
                  className={`flex-1 transition-all duration-200 ${
                    authMethod === 'phone' 
                      ? 'bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent text-white border-accent' 
                      : 'hover:bg-accent/10 hover:border-accent/50'
                  }`}
                  onClick={() => setAuthMethod('phone')}
                >
                  Phone
                </Button>
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            {/* Always show email signup, phone signup code kept but hidden */}
            <EmailSignUp />
            {false && authMethod === 'phone' && <PhoneSignUp />}
          </CardContent>
          
          <div className="px-6 pb-6">
            <div className="text-center pt-4 border-t border-accent/20">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-accent hover:text-accent/80 font-semibold"
                  onClick={() => navigate('/signin')}
                >
                  Sign In
                </Button>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
