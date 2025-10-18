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
import ShopItemsManager from "@/components/admin/ShopItemsManager";
import CarouselManager from "@/components/admin/CarouselManager";
import { SubAdminManager } from "@/components/admin/SubAdminManager";
import PromotionsManager from "@/components/admin/PromotionsManager";
import { PromoCodesManager } from "@/components/admin/PromoCodesManager";

// Import services
import { useUserRole } from "@/hooks/useUserRole";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { supabase } from "@/integrations/supabase/client";


const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { canManageUsers, loading: permissionsLoading } = useAdminPermissions();

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
        setLoading(false);
      } catch (error) {
        console.error('Error checking auth:', error);
        navigate("/signin");
      }
    };
    checkAuthAndRole();
  }, [isAdmin, roleLoading, navigate, toast]);

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
      
      <div className="container mx-auto p-1 sm:p-4 max-w-7xl space-y-2 sm:space-y-6">
        {/* Header - Mobile Compact */}
        <div className="flex items-center justify-between gap-2 p-2 sm:p-0">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="flex items-center gap-1 h-8">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h1 className="text-lg sm:text-2xl font-bold truncate">Admin Panel</h1>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="block lg:hidden px-1">
          <ScrollArea className="w-full">
            <Tabs defaultValue="shop" className="w-full">
              <TabsList className="inline-flex h-8 items-center justify-start rounded-md bg-muted p-0.5 text-muted-foreground w-max mb-2">
                <TabsTrigger value="shop" className="text-xs px-2 h-7">🛍️ Shop</TabsTrigger>
                <TabsTrigger value="promotions" className="text-xs px-2 h-7">📢 Ads</TabsTrigger>
                <TabsTrigger value="promo-codes" className="text-xs px-2 h-7">🏷️ Promo</TabsTrigger>
                <TabsTrigger value="carousel" className="text-xs px-2 h-7">🎠 Carousel</TabsTrigger>
                {(isAdmin || canManageUsers) && (
                  <TabsTrigger value="users" className="text-xs px-2 h-7">👥 Users</TabsTrigger>
                )}
              </TabsList>
              <ScrollBar orientation="horizontal" />
              
              <TabsContent value="shop" className="mt-0 space-y-2">
                <Card className="mx-1">
                  <CardContent className="pt-4">
                    <ShopItemsManager />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="promotions" className="mt-0 space-y-2">
                <Card className="mx-1">
                  <CardContent className="pt-4">
                    <PromotionsManager />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="promo-codes" className="mt-0 space-y-2">
                <Card className="mx-1">
                  <CardContent className="pt-4">
                    <PromoCodesManager />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="carousel" className="mt-0 space-y-2">
                <Card className="mx-1">
                  <CardContent className="pt-4">
                    <CarouselManager />
                  </CardContent>
                </Card>
              </TabsContent>

              {(isAdmin || canManageUsers) && (
                <TabsContent value="users" className="mt-0 space-y-2">
                  <Card className="mx-1">
                    <CardContent className="pt-4">
                      <SubAdminManager />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </ScrollArea>
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden lg:grid lg:grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  🛍️
                </div>
                Shop Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ShopItemsManager />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  📢
                </div>
                Promotional Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PromotionsManager />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  🏷️
                </div>
                Promo Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PromoCodesManager />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  🎠
                </div>
                Carousel Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CarouselManager />
            </CardContent>
          </Card>

          {(isAdmin || canManageUsers) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    👥
                  </div>
                  Sub Admin Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SubAdminManager />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;