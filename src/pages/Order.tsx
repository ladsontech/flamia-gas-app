import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { LocationPicker } from "@/components/order/LocationPicker";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCart } from "@/contexts/CartContext";
import { Flame, Truck } from "lucide-react";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { OrderService } from "@/services/orderService";

const Order = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    items, 
    clearCart, 
    getTotalPrice, 
    getSubtotal,
    promoCode, 
    promoDiscount 
  } = useCart();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [deliveryData, setDeliveryData] = useState({
    contact: "",
    location: null
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to place your order.",
          variant: "destructive",
        });
        navigate('/signin');
        return;
      }
      
      setIsAuthenticated(true);
      
      // Fetch user profile and default address
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      const { data: addresses } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id);
      
      if (profile) {
        setUserProfile(profile);
        const defaultAddress = addresses?.find(addr => addr.is_default) || addresses?.[0];
        if (defaultAddress) {
          setDeliveryData(prev => ({
            ...prev,
            location: {
              lat: Number(defaultAddress.latitude) || 0.3476,
              lng: Number(defaultAddress.longitude) || 32.5825,
              address: defaultAddress.address_line
            },
            contact: profile.phone_number || ""
          }));
        } else if (profile.phone_number) {
          setDeliveryData(prev => ({
            ...prev,
            contact: profile.phone_number
          }));
        }
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to place your order.",
        variant: "destructive",
      });
      navigate('/signin');
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Cart is Empty",
        description: "Please add some items to your cart before checkout.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to place your order.",
          variant: "destructive",
        });
        navigate('/signin');
        return;
      }
      
      // Get referral code if user was referred
      let referralCode = null;
      
      if (user) {
        try {
          const { data: referralData } = await supabase
            .from('referrals')
            .select('referral_code')
            .eq('referred_user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();
          
          if (referralData) {
            referralCode = referralData.referral_code;
          }
        } catch (error) {
          console.error('Error fetching referral:', error);
        }
      }
      
      // Create orders for each item in cart
      for (const item of items) {
        let orderDescription = '';
        let finalPrice = item.price;
        let promoDiscountPerItem = 0;
        
        // Calculate promo discount per item if applicable (only for gas items)
        const isGasItem = item.type === 'full_set' || item.type === 'refill' || item.type === 'accessory';
        if (promoDiscount > 0 && isGasItem) {
          const itemTotal = item.price * item.quantity;
          const cartSubtotal = getSubtotal();
          promoDiscountPerItem = Math.floor((itemTotal / cartSubtotal) * promoDiscount);
          finalPrice = Math.max(0, item.price - Math.floor(promoDiscountPerItem / item.quantity));
        }
        
        if (item.type === 'shop') {
          // Shop item format - different from gas
          orderDescription = `🛍️ SHOP ORDER\n\n`;
          orderDescription += `Business: ${item.businessName}\n`;
          orderDescription += `Product: ${item.name}\n`;
          if (item.description) {
            orderDescription += `Description: ${item.description}\n`;
          }
          orderDescription += `Quantity: ${item.quantity}\n`;
          orderDescription += `Unit Price: UGX ${item.price.toLocaleString()}\n`;
          orderDescription += `Total Amount: UGX ${(item.price * item.quantity).toLocaleString()}\n\n`;
          orderDescription += `Customer Contact: ${deliveryData.contact}\n`;
          orderDescription += `Delivery Address: ${deliveryData.location?.address || 'Not specified'}`;
        } else if (item.type === 'full_set') {
          orderDescription = `Order Type: Full Set\nBrand: ${item.brand}\nSize: ${item.size?.toUpperCase()}\nQuantity: ${item.quantity}\nOriginal Price: UGX ${item.price.toLocaleString()}`;
          if (promoCode) {
            orderDescription += `\nPromo Code: ${promoCode.toUpperCase()}\nDiscount Per Item: UGX ${Math.floor(promoDiscountPerItem / item.quantity).toLocaleString()}\nFinal Price: UGX ${finalPrice.toLocaleString()}`;
          }
          orderDescription += `\nTotal Amount: UGX ${(finalPrice * item.quantity).toLocaleString()}\nContact: ${deliveryData.contact}\nDelivery Location: ${deliveryData.location?.address || 'Not specified'}`;
        } else if (item.type === 'refill') {
          orderDescription = `Order Type: Refill\nBrand: ${item.brand}\nSize: ${item.size?.toUpperCase()}\nQuantity: ${item.quantity}\nOriginal Price: UGX ${item.price.toLocaleString()}`;
          if (promoCode) {
            orderDescription += `\nPromo Code: ${promoCode.toUpperCase()}\nDiscount Per Item: UGX ${Math.floor(promoDiscountPerItem / item.quantity).toLocaleString()}\nFinal Price: UGX ${finalPrice.toLocaleString()}`;
          }
          orderDescription += `\nTotal Amount: UGX ${(finalPrice * item.quantity).toLocaleString()}\nContact: ${deliveryData.contact}\nDelivery Location: ${deliveryData.location?.address || 'Not specified'}`;
        } else if (item.type === 'accessory') {
          orderDescription = `Order Type: Accessory\nItem: ${item.name}\nQuantity: ${item.quantity}\nOriginal Price: UGX ${item.price.toLocaleString()}`;
          if (promoCode) {
            orderDescription += `\nPromo Code: ${promoCode.toUpperCase()}\nDiscount Per Item: UGX ${Math.floor(promoDiscountPerItem / item.quantity).toLocaleString()}\nFinal Price: UGX ${finalPrice.toLocaleString()}`;
          }
          orderDescription += `\nTotal Amount: UGX ${(finalPrice * item.quantity).toLocaleString()}\nContact: ${deliveryData.contact}\nDelivery Location: ${deliveryData.location?.address || 'Not specified'}`;
        } else if (item.type === 'gadget') {
          orderDescription = `📦 PRODUCT ORDER\n\n`;
          orderDescription += `Item: ${item.name}\n`;
          if (item.description) {
            orderDescription += `Description: ${item.description}\n`;
          }
          orderDescription += `Quantity: ${item.quantity}\n`;
          orderDescription += `Unit Price: UGX ${item.price.toLocaleString()}\n`;
          orderDescription += `Total Amount: UGX ${(item.price * item.quantity).toLocaleString()}\n\n`;
          orderDescription += `Customer Contact: ${deliveryData.contact}\n`;
          orderDescription += `Delivery Address: ${deliveryData.location?.address || 'Not specified'}`;
        }
        
        await OrderService.createOrder(orderDescription, referralCode, deliveryData.location);
      }
      
      toast({
        title: "Orders Submitted Successfully!",
        description: `${items.length} orders have been received and will be processed by our team.`,
      });

      // Clear cart and navigate to account
      clearCart();
      navigate('/account');
    } catch (error) {
      console.error("Order submission error:", error);
      toast({
        title: "Error",
        description: "Failed to process your orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-white">
        <div className="container max-w-md px-3 py-6">
          <BackButton />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 text-accent rounded-full text-sm mb-3"
              >
                <Flame className="w-4 h-4" />
                Checkout
              </motion.div>
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="text-xl font-bold text-gray-900"
              >
                Your Cart
              </motion.h1>
            </div>

            <CartSummary />
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-white">
      <div className="container max-w-md px-3 py-6">
        <BackButton />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 text-accent rounded-full text-sm mb-3"
            >
              <Flame className="w-4 h-4" />
              Checkout
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="text-xl font-bold text-gray-900"
            >
              Complete Your Order
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground"
            >
              <Truck className="w-4 h-4" />
              <span>Free Delivery in Kampala</span>
            </motion.div>
          </div>

          {/* Cart Summary */}
          <CartSummary />

          {/* Delivery Information Form */}
          <Card className="p-4 bg-white/95 backdrop-blur-sm border-none shadow-lg">
            <div className="bg-gradient-to-r from-accent via-accent/80 to-accent/60 w-full h-1 mb-4" />
            
            <h3 className="font-semibold mb-4">Delivery Information</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Contact Number</Label>
                <Input
                  type="tel"
                  value={deliveryData.contact}
                  onChange={(e) => setDeliveryData(prev => ({ ...prev, contact: e.target.value }))}
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div>
                <LocationPicker
                  selectedLocation={deliveryData.location}
                  onLocationSelect={(loc) => {
                    setDeliveryData(prev => ({
                      ...prev,
                      location: loc
                    }));
                  }}
                />
              </div>

              <div className="text-center pt-4">
                <div className="text-2xl font-bold text-accent mb-2">
                  Total: UGX {getTotalPrice().toLocaleString()}
                </div>
                <p className="text-muted-foreground mb-4">Free delivery within Kampala</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-white"
                disabled={loading || !deliveryData.location || !deliveryData.contact}
              >
                {loading ? "Processing..." : "Place Orders"}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Order;