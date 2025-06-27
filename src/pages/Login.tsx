import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  const handleWhatsAppContact = () => {
    const message = "Hi! I'd like to place an order with Flamia Gas.";
    window.open(`https://wa.me/256789572007?text=${encodeURIComponent(message)}`, '_blank');
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
          <div className="flex justify-center mb-4">
            <img 
              src="/images/icon.png" 
              alt="Flamia Logo" 
              className="w-16 h-16" 
            />
          </div>
          <h2 className="text-2xl font-bold">Welcome to Flamia</h2>
          <p className="text-muted-foreground mt-2">Order gas cylinders directly via WhatsApp</p>
        </div>

        <Card className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-6 text-primary">
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">WhatsApp Ordering</span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              We've simplified our ordering process! Now you can place orders directly through WhatsApp for faster service and better communication.
            </p>
            
            <Button
              onClick={handleWhatsAppContact}
              className="w-full bg-accent hover:bg-accent/90 text-white py-3 rounded-lg font-semibold"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Order via WhatsApp
            </Button>
            
            <div className="mt-6 p-4 bg-accent/10 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">Why WhatsApp?</h3>
              <ul className="text-xs text-muted-foreground space-y-1 text-left">
                <li>• Instant communication with our team</li>
                <li>• Real-time order updates</li>
                <li>• Easy to share location and preferences</li>
                <li>• No need to create accounts</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;