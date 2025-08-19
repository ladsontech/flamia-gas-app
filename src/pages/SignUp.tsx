
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EmailSignUp } from "@/components/auth/EmailSignUp";
import { PhoneSignUp } from "@/components/auth/PhoneSignUp";

const SignUp = () => {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const navigate = useNavigate();

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
          <h2 className="text-2xl font-bold">Create Flamia Account</h2>
          <p className="text-muted-foreground mt-2">Choose your preferred registration method</p>
        </div>

        <Card className="p-6">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-center">Registration Method</CardTitle>
            <div className="flex gap-2 mt-4">
              <Button
                variant={authMethod === 'email' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setAuthMethod('email')}
              >
                Email
              </Button>
              <Button
                variant={authMethod === 'phone' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setAuthMethod('phone')}
              >
                Phone
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {authMethod === 'email' ? (
              <EmailSignUp />
            ) : (
              <PhoneSignUp />
            )}
          </CardContent>
          
          <div className="text-center mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={() => navigate('/signin')}
              >
                Sign In
              </Button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
