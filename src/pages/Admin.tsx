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
import { OrderNotifications } from "@/components/admin/OrderNotifications";

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
      const [ordersData, deliveryMenData] = await Promise.all([fetchOrders(), fetchDeliveryMen()]);
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
    <div className="min-h-screen bg-background">
      <AdminAppBar onLogout={() => navigate("/")} />
      
      <div className="container mx-auto p-2 sm:p-4 max-w-7xl space-y-4 sm:space-y-6">
        {/* Header - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="flex items-center gap-2 self-start">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold truncate">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">Manage your platform efficiently</p>
          </div>
          <div className="flex-shrink-0">
            <OrderNotifications onNewOrder={handleOrdersUpdate} />
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="block lg:hidden">
          <ScrollArea className="w-full">
            <Tabs defaultValue="gas" className="w-full">
              <TabsList className="inline-flex h-9 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground w-max">
                <TabsTrigger value="gas" className="text-xs px-3">🔥 Gas</TabsTrigger>
                <TabsTrigger value="products" className="text-xs px-3">📱 Products</TabsTrigger>
                <TabsTrigger value="business" className="text-xs px-3">🏪 Business</TabsTrigger>
                <TabsTrigger value="marketing" className="text-xs px-3">📢 Marketing</TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
              
              <TabsContent value="gas" className="mt-4 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Gas Operations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="orders" className="w-full">
                      <TabsList className="grid grid-cols-2 w-full h-8">
                        <TabsTrigger value="orders" className="text-xs">Orders</TabsTrigger>
                        <TabsTrigger value="withdrawals" className="text-xs">Withdrawals</TabsTrigger>
                      </TabsList>
                      <TabsContent value="orders" className="mt-3">
                        <AdminOrdersView orders={orders} deliveryMen={deliveryMen} onOrdersUpdate={handleOrdersUpdate} />
                      </TabsContent>
                      <TabsContent value="withdrawals" className="mt-3">
                        <WithdrawalsManager />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="products" className="mt-4 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Gadgets & Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="gadgets" className="w-full">
                      <TabsList className="grid grid-cols-2 w-full h-8">
                        <TabsTrigger value="gadgets" className="text-xs">Gadgets</TabsTrigger>
                        <TabsTrigger value="brands" className="text-xs">Brands</TabsTrigger>
                      </TabsList>
                      <TabsContent value="gadgets" className="mt-3">
                        <GadgetsManager />
                      </TabsContent>
                      <TabsContent value="brands" className="mt-3">
                        <BrandsManager />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="business" className="mt-4 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Business Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="businesses" className="w-full">
                      <TabsList className="grid grid-cols-3 w-full h-8 text-xs">
                        <TabsTrigger value="businesses" className="text-xs px-1">Businesses</TabsTrigger>
                        <TabsTrigger value="products" className="text-xs px-1">Products</TabsTrigger>
                        <TabsTrigger value="seller_apps" className="text-xs px-1">Sellers</TabsTrigger>
                      </TabsList>
                      <TabsContent value="businesses" className="mt-3">
                        <BusinessesManager />
                      </TabsContent>
                      <TabsContent value="products" className="mt-3">
                        <BusinessProductsManager />
                      </TabsContent>
                      <TabsContent value="seller_apps" className="mt-3">
                        <SellerApplicationsManager />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="marketing" className="mt-4 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Marketing & Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="promotions" className="w-full">
                      <TabsList className="grid grid-cols-3 w-full h-8">
                        <TabsTrigger value="promotions" className="text-xs px-1">Promos</TabsTrigger>
                        <TabsTrigger value="carousel" className="text-xs px-1">Carousel</TabsTrigger>
                        <TabsTrigger value="marketplace" className="text-xs px-1">Settings</TabsTrigger>
                      </TabsList>
                      <TabsContent value="promotions" className="mt-3">
                        <PromotionsManager />
                      </TabsContent>
                      <TabsContent value="carousel" className="mt-3">
                        <CarouselManager />
                      </TabsContent>
                      <TabsContent value="marketplace" className="mt-3">
                        <MarketplaceSettings />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6">
          {/* Gas Operations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  🔥
                </div>
                Gas Operations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Tabs defaultValue="orders" className="w-full">
                <TabsList className="grid grid-cols-2 w-full text-sm">
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                </TabsList>
                <TabsContent value="orders" className="mt-4">
                  <AdminOrdersView orders={orders} deliveryMen={deliveryMen} onOrdersUpdate={handleOrdersUpdate} />
                </TabsContent>
                <TabsContent value="withdrawals" className="mt-4">
                  <WithdrawalsManager />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Gadgets & Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  📱
                </div>
                Gadgets & Products
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Tabs defaultValue="gadgets" className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="gadgets">Gadgets</TabsTrigger>
                  <TabsTrigger value="brands">Brands</TabsTrigger>
                </TabsList>
                <TabsContent value="gadgets" className="mt-4">
                  <GadgetsManager />
                </TabsContent>
                <TabsContent value="brands" className="mt-4">
                  <BrandsManager />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Business Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  🏪
                </div>
                Business Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Tabs defaultValue="businesses" className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="businesses">Businesses</TabsTrigger>
                  <TabsTrigger value="products">Products</TabsTrigger>
                  <TabsTrigger value="seller_apps">Seller Apps</TabsTrigger>
                </TabsList>
                <TabsContent value="businesses" className="mt-4">
                  <BusinessesManager />
                </TabsContent>
                <TabsContent value="products" className="mt-4">
                  <BusinessProductsManager />
                </TabsContent>
                <TabsContent value="seller_apps" className="mt-4">
                  <SellerApplicationsManager />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Marketing & Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  📢
                </div>
                Marketing & Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Tabs defaultValue="promotions" className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="promotions">Promotions</TabsTrigger>
                  <TabsTrigger value="carousel">Carousel</TabsTrigger>
                  <TabsTrigger value="marketplace">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="promotions" className="mt-4">
                  <PromotionsManager />
                </TabsContent>
                <TabsContent value="carousel" className="mt-4">
                  <CarouselManager />
                </TabsContent>
                <TabsContent value="marketplace" className="mt-4">
                  <MarketplaceSettings />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;