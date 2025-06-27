import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, MessageCircle } from "lucide-react";
import AppBar from "@/components/AppBar";

const Orders = () => {
  const navigate = useNavigate();

  const handleWhatsAppContact = () => {
    const message = "Hi! I'd like to check on my order status.";
    window.open(`https://wa.me/256789572007?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <>
      <AppBar />
      <div className="pt-20 px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Order Status</h1>
              <p className="text-muted-foreground">Check your order status via WhatsApp</p>
            </div>
          </div>

          <Card className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Track Your Orders</h3>
            <p className="text-muted-foreground mb-6">
              All orders are now processed through WhatsApp for better communication and faster service. 
              Contact us to check your order status or place a new order.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={handleWhatsAppContact}
                className="w-full bg-accent hover:bg-accent/90 text-white"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Check Order Status
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/order')}
                className="w-full"
              >
                Place New Order
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Orders;