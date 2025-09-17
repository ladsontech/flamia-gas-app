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
import { UserManagement } from "@/components/admin/UserManagement";
import { OrderNotifications } from "@/components/admin/OrderNotifications";

// Import services
import { fetchOrders, fetchDeliveryMen } from "@/services/database";
import { useUserRole } from "@/hooks/useUserRole";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { supabase } from "@/integrations/supabase/client";


const Admin = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [deliveryMen, setDeliveryMen] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading, userRole } = useUserRole();
  const { 
    canManageOrders, 
    canManageWithdrawals, 
    canManageGadgets, 
    canManageBrands,
    canManageBusinesses,
    canManageProducts,
    canManageSellerApplications,
    canManagePromotions,
    canManageCarousel,
    canManageMarketplaceSettings,
    
    loading: permissionsLoading
  } = useAdminPermissions();

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

  if (loading || roleLoading || permissionsLoading) {
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
      
      <div className="container mx-auto p-1 sm:p-4 max-w-7xl space-y-2 sm:space-y-6">
        {/* Header - Mobile Compact */}
        <div className="flex items-center justify-between gap-2 p-2 sm:p-0">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="flex items-center gap-1 h-8">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h1 className="text-lg sm:text-2xl font-bold truncate">Admin</h1>
          </div>
          <div className="flex-shrink-0">
            <OrderNotifications onNewOrder={handleOrdersUpdate} />
          </div>
        </div>

        {/* Check if user has any permissions */}
        {!canManageOrders && !canManageWithdrawals && !canManageGadgets && !canManageBrands && 
         !canManageBusinesses && !canManageProducts && !canManageSellerApplications && 
         !canManagePromotions && !canManageCarousel && !canManageMarketplaceSettings ? (
          <Card className="mx-2 sm:mx-auto sm:max-w-2xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="flex items-center justify-center gap-2 text-base">
                <Shield className="h-4 w-4" />
                No Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3 pt-0">
              <p className="text-sm">You don't have any admin permissions.</p>
              <Button onClick={() => navigate("/")} variant="outline" size="sm">
                Go Home
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile and Desktop content */}

        {/* Mobile Tabs */}
        <div className="block lg:hidden px-1">
          <ScrollArea className="w-full">
            <Tabs defaultValue={
              (canManageOrders || canManageWithdrawals) ? "gas" :
              (canManageGadgets || canManageBrands) ? "products" :
              (canManageBusinesses || canManageProducts || canManageSellerApplications) ? "business" : 
              (canManagePromotions || canManageCarousel || canManageMarketplaceSettings) ? "marketing" :
              userRole === 'super_admin' ? "users" : "gas"
            } className="w-full">
              <TabsList className="inline-flex h-8 items-center justify-start rounded-md bg-muted p-0.5 text-muted-foreground w-max mb-2">
                {(canManageOrders || canManageWithdrawals) && <TabsTrigger value="gas" className="text-xs px-2 h-7">🔥 Gas</TabsTrigger>}
                {(canManageGadgets || canManageBrands) && <TabsTrigger value="products" className="text-xs px-2 h-7">📱 Tech</TabsTrigger>}
                {(canManageBusinesses || canManageProducts || canManageSellerApplications) && <TabsTrigger value="business" className="text-xs px-2 h-7">🏪 Biz</TabsTrigger>}
                {(canManagePromotions || canManageCarousel || canManageMarketplaceSettings) && <TabsTrigger value="marketing" className="text-xs px-2 h-7">📢 Ads</TabsTrigger>}
                {userRole === 'super_admin' && <TabsTrigger value="users" className="text-xs px-2 h-7">👥 Users</TabsTrigger>}
              </TabsList>
              <ScrollBar orientation="horizontal" />
              
              <TabsContent value="gas" className="mt-0 space-y-2">
                {(canManageOrders || canManageWithdrawals) && (
                  <Card className="mx-1">
                    <CardHeader className="pb-2 pt-3">
                      <CardTitle className="text-base">Gas Operations</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Tabs defaultValue={canManageOrders ? "orders" : "withdrawals"} className="w-full">
                        <TabsList className={`grid w-full h-7 ${canManageOrders && canManageWithdrawals ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {canManageOrders && <TabsTrigger value="orders" className="text-xs h-6">Orders</TabsTrigger>}
                          {canManageWithdrawals && <TabsTrigger value="withdrawals" className="text-xs h-6">Withdrawals</TabsTrigger>}
                        </TabsList>
                        {canManageOrders && (
                          <TabsContent value="orders" className="mt-2">
                            <AdminOrdersView orders={orders} deliveryMen={deliveryMen} onOrdersUpdate={handleOrdersUpdate} />
                          </TabsContent>
                        )}
                        {canManageWithdrawals && (
                          <TabsContent value="withdrawals" className="mt-2">
                            <WithdrawalsManager />
                          </TabsContent>
                        )}
                      </Tabs>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="products" className="mt-0 space-y-2">
                {(canManageGadgets || canManageBrands) && (
                  <Card className="mx-1">
                    <CardHeader className="pb-2 pt-3">
                      <CardTitle className="text-base">Tech & Products</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Tabs defaultValue={canManageGadgets ? "gadgets" : "brands"} className="w-full">
                        <TabsList className={`grid w-full h-7 ${canManageGadgets && canManageBrands ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {canManageGadgets && <TabsTrigger value="gadgets" className="text-xs h-6">Gadgets</TabsTrigger>}
                          {canManageBrands && <TabsTrigger value="brands" className="text-xs h-6">Brands</TabsTrigger>}
                        </TabsList>
                        {canManageGadgets && (
                          <TabsContent value="gadgets" className="mt-2">
                            <GadgetsManager />
                          </TabsContent>
                        )}
                        {canManageBrands && (
                          <TabsContent value="brands" className="mt-2">
                            <BrandsManager />
                          </TabsContent>
                        )}
                      </Tabs>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="business" className="mt-0 space-y-2">
                {(canManageBusinesses || canManageProducts || canManageSellerApplications) && (
                  <Card className="mx-1">
                    <CardHeader className="pb-2 pt-3">
                      <CardTitle className="text-base">Business</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Tabs defaultValue={canManageBusinesses ? "businesses" : canManageProducts ? "products" : "seller_apps"} className="w-full">
                        <TabsList className={`grid w-full h-7 text-xs ${
                          [canManageBusinesses, canManageProducts, canManageSellerApplications].filter(Boolean).length === 3 ? 'grid-cols-3' :
                          [canManageBusinesses, canManageProducts, canManageSellerApplications].filter(Boolean).length === 2 ? 'grid-cols-2' : 'grid-cols-1'
                        }`}>
                          {canManageBusinesses && <TabsTrigger value="businesses" className="text-xs px-1 h-6">Stores</TabsTrigger>}
                          {canManageProducts && <TabsTrigger value="products" className="text-xs px-1 h-6">Items</TabsTrigger>}
                          {canManageSellerApplications && <TabsTrigger value="seller_apps" className="text-xs px-1 h-6">Apps</TabsTrigger>}
                        </TabsList>
                        {canManageBusinesses && (
                          <TabsContent value="businesses" className="mt-2">
                            <BusinessesManager />
                          </TabsContent>
                        )}
                        {canManageProducts && (
                          <TabsContent value="products" className="mt-2">
                            <BusinessProductsManager />
                          </TabsContent>
                        )}
                        {canManageSellerApplications && (
                          <TabsContent value="seller_apps" className="mt-2">
                            <SellerApplicationsManager />
                          </TabsContent>
                        )}
                      </Tabs>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="marketing" className="mt-0 space-y-2">
                {(canManagePromotions || canManageCarousel || canManageMarketplaceSettings) && (
                  <Card className="mx-1">
                    <CardHeader className="pb-2 pt-3">
                      <CardTitle className="text-base">Marketing</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Tabs defaultValue={canManagePromotions ? "promotions" : canManageCarousel ? "carousel" : "marketplace"} className="w-full">
                        <TabsList className={`grid w-full h-7 ${
                          [canManagePromotions, canManageCarousel, canManageMarketplaceSettings].filter(Boolean).length === 3 ? 'grid-cols-3' :
                          [canManagePromotions, canManageCarousel, canManageMarketplaceSettings].filter(Boolean).length === 2 ? 'grid-cols-2' : 'grid-cols-1'
                        }`}>
                          {canManagePromotions && <TabsTrigger value="promotions" className="text-xs px-1 h-6">Promos</TabsTrigger>}
                          {canManageCarousel && <TabsTrigger value="carousel" className="text-xs px-1 h-6">Slides</TabsTrigger>}
                          {canManageMarketplaceSettings && <TabsTrigger value="marketplace" className="text-xs px-1 h-6">Config</TabsTrigger>}
                        </TabsList>
                        {canManagePromotions && (
                          <TabsContent value="promotions" className="mt-2">
                            <PromotionsManager />
                          </TabsContent>
                        )}
                        {canManageCarousel && (
                          <TabsContent value="carousel" className="mt-2">
                            <CarouselManager />
                          </TabsContent>
                        )}
                        {canManageMarketplaceSettings && (
                          <TabsContent value="marketplace" className="mt-2">
                            <MarketplaceSettings />
                          </TabsContent>
                        )}
                      </Tabs>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="users" className="mt-0 space-y-2">
                {userRole === 'super_admin' && (
                  <Card className="mx-1">
                    <CardHeader className="pb-2 pt-3">
                      <CardTitle className="text-base">Users</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <UserManagement />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6">
          {/* Gas Operations */}
          {(canManageOrders || canManageWithdrawals) && (
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
                <Tabs defaultValue={canManageOrders ? "orders" : "withdrawals"} className="w-full">
                  <TabsList className={`grid w-full text-sm ${canManageOrders && canManageWithdrawals ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {canManageOrders && <TabsTrigger value="orders">Orders</TabsTrigger>}
                    {canManageWithdrawals && <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>}
                  </TabsList>
                  {canManageOrders && (
                    <TabsContent value="orders" className="mt-4">
                      <AdminOrdersView orders={orders} deliveryMen={deliveryMen} onOrdersUpdate={handleOrdersUpdate} />
                    </TabsContent>
                  )}
                  {canManageWithdrawals && (
                    <TabsContent value="withdrawals" className="mt-4">
                      <WithdrawalsManager />
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Gadgets & Products */}
          {(canManageGadgets || canManageBrands) && (
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
                <Tabs defaultValue={canManageGadgets ? "gadgets" : "brands"} className="w-full">
                  <TabsList className={`grid w-full ${canManageGadgets && canManageBrands ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {canManageGadgets && <TabsTrigger value="gadgets">Gadgets</TabsTrigger>}
                    {canManageBrands && <TabsTrigger value="brands">Brands</TabsTrigger>}
                  </TabsList>
                  {canManageGadgets && (
                    <TabsContent value="gadgets" className="mt-4">
                      <GadgetsManager />
                    </TabsContent>
                  )}
                  {canManageBrands && (
                    <TabsContent value="brands" className="mt-4">
                      <BrandsManager />
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Business Management */}
          {(canManageBusinesses || canManageProducts || canManageSellerApplications) && (
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
                <Tabs defaultValue={canManageBusinesses ? "businesses" : canManageProducts ? "products" : "seller_apps"} className="w-full">
                  <TabsList className={`grid w-full ${
                    [canManageBusinesses, canManageProducts, canManageSellerApplications].filter(Boolean).length === 3 ? 'grid-cols-3' :
                    [canManageBusinesses, canManageProducts, canManageSellerApplications].filter(Boolean).length === 2 ? 'grid-cols-2' : 'grid-cols-1'
                  }`}>
                    {canManageBusinesses && <TabsTrigger value="businesses">Businesses</TabsTrigger>}
                    {canManageProducts && <TabsTrigger value="products">Products</TabsTrigger>}
                    {canManageSellerApplications && <TabsTrigger value="seller_apps">Seller Apps</TabsTrigger>}
                  </TabsList>
                  {canManageBusinesses && (
                    <TabsContent value="businesses" className="mt-4">
                      <BusinessesManager />
                    </TabsContent>
                  )}
                  {canManageProducts && (
                    <TabsContent value="products" className="mt-4">
                      <BusinessProductsManager />
                    </TabsContent>
                  )}
                  {canManageSellerApplications && (
                    <TabsContent value="seller_apps" className="mt-4">
                      <SellerApplicationsManager />
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Marketing & Content */}
          {(canManagePromotions || canManageCarousel || canManageMarketplaceSettings) && (
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
                <Tabs defaultValue={canManagePromotions ? "promotions" : canManageCarousel ? "carousel" : "marketplace"} className="w-full">
                  <TabsList className={`grid w-full ${
                    [canManagePromotions, canManageCarousel, canManageMarketplaceSettings].filter(Boolean).length === 3 ? 'grid-cols-3' :
                    [canManagePromotions, canManageCarousel, canManageMarketplaceSettings].filter(Boolean).length === 2 ? 'grid-cols-2' : 'grid-cols-1'
                  }`}>
                    {canManagePromotions && <TabsTrigger value="promotions">Promotions</TabsTrigger>}
                    {canManageCarousel && <TabsTrigger value="carousel">Carousel</TabsTrigger>}
                    {canManageMarketplaceSettings && <TabsTrigger value="marketplace">Settings</TabsTrigger>}
                  </TabsList>
                  {canManagePromotions && (
                    <TabsContent value="promotions" className="mt-4">
                      <PromotionsManager />
                    </TabsContent>
                  )}
                  {canManageCarousel && (
                    <TabsContent value="carousel" className="mt-4">
                      <CarouselManager />
                    </TabsContent>
                  )}
                  {canManageMarketplaceSettings && (
                    <TabsContent value="marketplace" className="mt-4">
                      <MarketplaceSettings />
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          )}
          {/* Super Admin Only - User Management */}
          {userRole === 'super_admin' && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    👥
                  </div>
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default Admin;