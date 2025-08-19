
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EmailSignIn } from "@/components/auth/EmailSignIn";
import { PhoneSignIn } from "@/components/auth/PhoneSignIn";

const SignIn = () => {
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
          <h2 className="text-2xl font-bold">Sign In to Flamia</h2>
          <p className="text-muted-foreground mt-2">Choose your preferred sign-in method</p>
        </div>

        <Card className="p-6">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-center">Authentication Method</CardTitle>
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
              <EmailSignIn />
            ) : (
              <PhoneSignIn />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
