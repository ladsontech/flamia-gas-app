import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

// Import components
import AdminAppBar from "@/components/admin/AdminAppBar";
import { AdminOrdersView } from "@/components/admin/AdminOrdersView";
import PromotionsManager from "@/components/admin/PromotionsManager";
import GadgetsManager from "@/components/admin/GadgetsManager";
import BrandsManager from "@/components/admin/BrandsManager";
import CarouselManager from "@/components/admin/CarouselManager";
import BusinessesManager from "@/components/admin/BusinessesManager";
import BusinessProductsManager from "@/components/admin/BusinessProductsManager";
import SellerApplicationsManager from "@/components/admin/SellerApplicationsManager";
import MarketplaceSettings from "@/components/admin/MarketplaceSettings";
import { WithdrawalsManager } from "@/components/admin/WithdrawalsManager";

// Import services
import { fetchOrders, fetchDeliveryMen } from "@/services/database";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";

const Admin = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [deliveryMen, setDeliveryMen] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();

  // Check authentication and admin role
  useEffect(() => {
    const checkAuthAndRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Authentication Required",
            description: "Please sign in to access admin panel",
            variant: "destructive"
          });
          navigate("/signin");
          return;
        }

        setUser(user);

        if (!roleLoading && !isAdmin) {
          toast({
            title: "Access Denied",
            description: "You don't have admin privileges",
            variant: "destructive"
          });
          navigate("/");
          return;
        }

        if (isAdmin) {
          await loadOrdersAndDeliveryMen();
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        navigate("/signin");
      }
    };

    checkAuthAndRole();
  }, [isAdmin, roleLoading, navigate, toast]);

  const loadOrdersAndDeliveryMen = async () => {
    try {
      const [ordersData, deliveryMenData] = await Promise.all([
        fetchOrders(),
        fetchDeliveryMen()
      ]);
      setOrders(ordersData);
      setDeliveryMen(deliveryMenData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrdersUpdate = () => {
    loadOrdersAndDeliveryMen();
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>You need admin privileges to access this page.</p>
            <Button onClick={() => navigate("/")} variant="outline">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminAppBar onLogout={() => navigate("/")} />
      
      <div className="container mx-auto p-2 sm:p-4 max-w-7xl">
        <Tabs defaultValue="orders" className="w-full">
          {/* Mobile-responsive tabs */}
          <div className="mb-4">
            <ScrollArea className="w-full">
              <TabsList className="grid grid-cols-10 w-full min-w-[800px] h-auto p-1 bg-muted rounded-lg">
                <TabsTrigger value="orders" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-background">
                  Orders
                </TabsTrigger>
                <TabsTrigger value="withdrawals" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-background">
                  Withdrawals
                </TabsTrigger>
                <TabsTrigger value="promotions" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-background">
                  Promos
                </TabsTrigger>
                <TabsTrigger value="gadgets" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-background">
                  Gadgets
                </TabsTrigger>
                <TabsTrigger value="brands" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-background">
                  Brands
                </TabsTrigger>
                <TabsTrigger value="carousel" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-background">
                  Carousel
                </TabsTrigger>
                <TabsTrigger value="businesses" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-background">
                  Business
                </TabsTrigger>
                <TabsTrigger value="products" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-background">
                  Products
                </TabsTrigger>
                <TabsTrigger value="seller_apps" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-background">
                  Seller Apps
                </TabsTrigger>
                <TabsTrigger value="marketplace" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-background">
                  Marketplace
                </TabsTrigger>
              </TabsList>
            </ScrollArea>
          </div>
          
          <div className="space-y-4">
            <TabsContent value="orders" className="mt-0">
              <AdminOrdersView orders={orders} deliveryMen={deliveryMen} onOrdersUpdate={handleOrdersUpdate} />
            </TabsContent>

            <TabsContent value="withdrawals" className="mt-0">
              <WithdrawalsManager />
            </TabsContent>
            
            <TabsContent value="promotions" className="mt-0">
              <PromotionsManager />
            </TabsContent>
            
            <TabsContent value="gadgets" className="mt-0">
              <GadgetsManager />
            </TabsContent>
            
            <TabsContent value="brands" className="mt-0">
              <BrandsManager />
            </TabsContent>
            
            <TabsContent value="carousel" className="mt-0">
              <CarouselManager />
            </TabsContent>
            
            <TabsContent value="businesses" className="mt-0">
              <BusinessesManager />
            </TabsContent>
            
            <TabsContent value="products" className="mt-0">
              <BusinessProductsManager />
            </TabsContent>

            <TabsContent value="seller_apps" className="mt-0">
              <SellerApplicationsManager />
            </TabsContent>

            <TabsContent value="marketplace" className="mt-0">
              <MarketplaceSettings />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;