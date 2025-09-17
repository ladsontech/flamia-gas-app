import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { OrderHeader } from "@/components/order/OrderHeader";
import { OrderFormFields } from "@/components/order/OrderFormFields";
import { MultipleOrderForm } from "@/components/order/MultipleOrderForm";
import { Flame, Truck } from "lucide-react";
import Footer from "@/components/Footer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { staticBrands, refillBrands } from "@/components/home/BrandsData";
import { accessories } from "@/components/accessories/AccessoriesData";
import { supabase } from "@/integrations/supabase/client";
import { OrderService } from "@/services/orderService";

const Order = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [accessoryData, setAccessoryData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showMultipleOrders, setShowMultipleOrders] = useState(false);

  const selectedBrand = searchParams.get("brand") || "";
  const orderType = searchParams.get("type") || "fullset";
  const size = searchParams.get("size") || "";
  const accessoryId = searchParams.get("accessory");

  const gasBrands = [
    "Total", 
    "Taifa", 
    "Stabex", 
    "Shell", 
    "Hass", 
    "Meru", 
    "Ven Gas", 
    "Ola Energy", 
    "Oryx", 
    "Ultimate", 
    "K Gas", 
    "C Gas", 
    "Hashi",
    "Mogas",
    "Star"
  ];

  const [formData, setFormData] = useState({
    address: "",
    type: orderType,
    size: size,
    quantity: 1,
    contact: "",
    accessory_id: accessoryId || undefined,
    brand: selectedBrand || (accessoryData ? "" : "Total"),
    location: undefined
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
          setFormData(prev => ({
            ...prev,
            address: defaultAddress.address_line,
            contact: profile.phone_number || ""
          }));
        }
      }
    };

    checkAuth();

    // Pre-fill form data based on URL params
    if (selectedBrand) {
      setFormData(prev => ({ ...prev, brand: selectedBrand }));
    }
    if (size) {
      setFormData(prev => ({ ...prev, size }));
    }
    if (orderType) {
      setFormData(prev => ({ ...prev, type: orderType }));
    }

    // Load accessory data if accessory order
    if (accessoryId) {
      const accessory = accessories.find(acc => acc.id === accessoryId);
      if (accessory) {
        setAccessoryData(accessory);
        setFormData(prev => ({
          ...prev,
          accessory_id: accessoryId,
          type: 'accessory'
        }));
      }
    }
  }, [selectedBrand, orderType, size, accessoryId, navigate, toast]);

  const getPrice = () => {
    if (accessoryData) {
      return accessoryData.price * formData.quantity;
    }

    let selectedBrandData = null;
    
    if (formData.type === "refill") {
      selectedBrandData = refillBrands.find(brand => brand.brand === formData.brand);
      if (selectedBrandData && formData.size) {
        const priceKey = `refill_price_${formData.size}`;
        const priceStr = selectedBrandData[priceKey];
        if (priceStr) {
          const price = parseInt(priceStr.replace(/[^0-9]/g, ''));
          return price * formData.quantity;
        }
      }
    } else {
      selectedBrandData = staticBrands.find(brand => brand.brand === formData.brand);
      if (selectedBrandData && formData.size) {
        const priceKey = `price_${formData.size}`;
        const priceStr = selectedBrandData[priceKey];
        if (priceStr) {
          const price = parseInt(priceStr.replace(/[^0-9]/g, ''));
          return price * formData.quantity;
        }
      }
    }
    return 0;
  };

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
      
      let orderDescription = "";
      
      if (accessoryData) {
        orderDescription = `${accessoryData.name} (Qty: ${formData.quantity}) - Contact: ${formData.contact} - Address: ${formData.address}`;
      } else {
        const orderTypeText = formData.type === "refill" ? "refill" : "full set";
        orderDescription = `${formData.brand} ${formData.size.toUpperCase()} ${orderTypeText} (Qty: ${formData.quantity}) - Contact: ${formData.contact} - Address: ${formData.address}`;
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
      
      // Save order to database
      await OrderService.createOrder(orderDescription, referralCode);
      
      toast({
        title: "Order Submitted Successfully!",
        description: "Your order has been received and will be processed by our team.",
      });

      // Reset form
      setFormData({
        address: "",
        type: orderType,
        size: size,
        quantity: 1,
        contact: "",
        accessory_id: accessoryId || undefined,
        brand: selectedBrand || (accessoryData ? "" : "Total"),
        location: undefined
      });
      
      // Navigate to orders page
      navigate('/account');
    } catch (error) {
      console.error("Order submission error:", error);
      toast({
        title: "Error",
        description: "Failed to process your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMultipleOrderSubmit = async (items, address, contact, location) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to place your order.",
        variant: "destructive",
      });
      navigate('/signin');
      return;
    }

    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
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
      
      // Create multiple orders
      for (const item of items) {
        let orderDescription = '';
        
        if (item.type === 'full_set') {
          orderDescription = `${item.brand} ${item.size.toUpperCase()} full set (Qty: ${item.quantity}) - Contact: ${contact} - Address: ${address}`;
        } else if (item.type === 'refill') {
          orderDescription = `${item.brand} ${item.size.toUpperCase()} refill (Qty: ${item.quantity}) - Contact: ${contact} - Address: ${address}`;
        } else if (item.type === 'accessory') {
          const accessory = accessories.find(a => a.id === item.accessoryId);
          orderDescription = `${accessory?.name} (Qty: ${item.quantity}) - Contact: ${contact} - Address: ${address}`;
        }
        
        await OrderService.createOrder(orderDescription, referralCode);
      }
      
      toast({
        title: "Orders Submitted Successfully!",
        description: `${items.length} orders have been received and will be processed by our team.`,
      });
      
      navigate('/account');
    } catch (error) {
      console.error("Multiple orders submission error:", error);
      toast({
        title: "Error",
        description: "Failed to process your orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${formData.type === "fullset" ? "bg-gradient-to-b from-primary to-white" : "bg-gradient-to-b from-accent/5 to-white"}`}>
      <div className="container max-w-md px-3 py-6">
        <BackButton />
        
        {showMultipleOrders ? (
          <MultipleOrderForm 
            onSubmit={handleMultipleOrderSubmit}
            onCancel={() => setShowMultipleOrders(false)}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Toggle Button */}
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setShowMultipleOrders(true)}
                className="mb-4"
              >
                Order Multiple Items
              </Button>
            </div>

            <Card className={`p-4 relative overflow-hidden border-none shadow-lg ${formData.type === "fullset" ? "bg-white/80 backdrop-blur-sm" : "bg-white/95"}`}>
              <div className={`absolute top-0 left-0 w-full h-1 ${formData.type === "fullset" ? "bg-gradient-to-r from-flame-inner via-flame-middle to-flame-outer opacity-75" : "bg-accent"}`} />
              
              {accessoryData ? (
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 text-accent rounded-full text-sm mb-3"
                  >
                    <Flame className="w-4 h-4" />
                    Accessory Order
                  </motion.div>
                  <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="text-xl font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent"
                  >
                    {accessoryData.name}
                  </motion.h1>
                  <p className="text-accent font-medium mt-2">
                    UGX {accessoryData.price.toLocaleString()}
                  </p>
                  
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
              ) : (
                <OrderHeader orderType={formData.type} />
              )}

              <form onSubmit={handleSubmit} className="space-y-4 relative">
                {!accessoryData && (
                  <OrderFormFields 
                    formData={formData}
                    setFormData={setFormData}
                    selectedBrand={selectedBrand}
                  />
                )}
                
                {accessoryData && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="brand" className="block text-sm font-medium">Preferred Brand</Label>
                      <Select
                        value={formData.brand}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, brand: value }))}
                      >
                        <SelectTrigger id="brand" className="w-full px-3 py-2 border border-accent/20 rounded-md focus:outline-none focus:ring-1 focus:ring-accent">
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {gasBrands.map(brand => (
                            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="block text-sm font-medium">Quantity</Label>
                      <input
                        id="quantity"
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                        required
                        className="w-full px-3 py-2 border border-accent/20 rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contact" className="block text-sm font-medium">Contact Number</Label>
                      <input
                        id="contact"
                        type="tel"
                        value={formData.contact}
                        onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                        required
                        placeholder="Enter your phone number"
                        className="w-full px-3 py-2 border border-accent/20 rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address" className="block text-sm font-medium">Delivery Address</Label>
                      <input
                        id="address"
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        required
                        placeholder="Enter your delivery address"
                        className="w-full px-3 py-2 border border-accent/20 rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    
                    <div className="text-center pt-2">
                      <p className="text-lg font-semibold text-primary">
                        Total: UGX {(accessoryData.price * formData.quantity).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Free delivery within Kampala</p>
                    </div>
                  </div>
                )}
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="pt-4"
                >
                  <Button
                    type="submit"
                    className={`w-full text-white relative overflow-hidden group h-10 ${
                      formData.type === "fullset" 
                        ? "bg-accent hover:bg-accent/90" 
                        : "bg-accent/90 hover:bg-accent"
                    }`}
                    disabled={loading}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? "Processing..." : "Submit Order"}
                      <Flame className="w-4 h-4 transition-transform group-hover:rotate-12" />
                    </span>
                    <div className={`absolute inset-0 ${
                      formData.type === "fullset"
                        ? "bg-gradient-to-r from-flame-inner via-flame-middle to-flame-outer opacity-0 group-hover:opacity-20"
                        : "bg-accent opacity-0 group-hover:opacity-10"
                    } transition-opacity`} />
                  </Button>
                </motion.div>
              </form>
            </Card>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Order;