import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Order = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const selectedBrand = searchParams.get("brand") || "Premium Gas";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast({
      title: "Order Placed Successfully",
      description: "We'll deliver your gas cylinder soon!",
    });
    
    setLoading(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-white py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="container max-w-md"
      >
        <Card className="glass-card p-6">
          <div className="text-center mb-6">
            <span className="px-4 py-1 bg-accent text-accent-foreground rounded-full text-sm mb-4 inline-block">
              New Order
            </span>
            <h1 className="text-2xl font-bold">Order Gas Cylinder</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="brand">Selected Brand</Label>
              <Input
                id="brand"
                value={selectedBrand}
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" required placeholder="John Doe" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Delivery Address</Label>
              <Input
                id="address"
                required
                placeholder="123 Main St, City"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                required
                placeholder="+1 234 567 8900"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={loading}
              >
                {loading ? "Processing..." : "Place Order"}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Order;