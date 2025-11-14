import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Store, Package, BarChart3, Settings, ShoppingBag, Users, TrendingUp, DollarSign } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { ShopSettingsForm } from '@/components/seller/ShopSettingsForm';
import { CheckoutSettingsForm } from '@/components/seller/CheckoutSettingsForm';
import { ProductForm } from '@/components/seller/ProductForm';
import { ProductsList } from '@/components/seller/ProductsList';
import { SellerOrdersList } from '@/components/seller/SellerOrdersList';
import { StorefrontAnalytics } from '@/components/storefront/StorefrontAnalytics';
import { StorePerformance } from '@/components/storefront/StorePerformance';
import { AffiliateShopSettings } from '@/components/affiliate/AffiliateShopSettings';

export default function StorefrontDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [shopType, setShopType] = useState<'seller' | 'affiliate'>('seller');
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    checkAuthAndLoadShop();
  }, [slug]);

  const checkAuthAndLoadShop = async () => {
    try {
      setLoading(true);
      
      // Check authentication
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        // Not logged in, redirect to auth page
        const returnTo = encodeURIComponent(window.location.href);
        navigate(`/store/${slug}/auth?return_to=${returnTo}`);
        return;
      }

      setUser(currentUser);

      // Determine if this is a subdomain or path-based access
      const isSubdomain = window.location.hostname.includes('.flamia.store') && 
                          window.location.hostname !== 'flamia.store';
      
      let shopData = null;
      let type: 'seller' | 'affiliate' = 'seller';

      if (isSubdomain) {
        // Subdomain access - seller shop
        const { data } = await supabase
          .from('seller_shops')
          .select('*')
          .eq('shop_slug', slug)
          .eq('is_approved', true)
          .single();
        shopData = data;
        type = 'seller';
      } else {
        // Path-based access - check both
        const { data: sellerData } = await supabase
          .from('seller_shops')
          .select('*')
          .eq('shop_slug', slug)
          .eq('is_approved', true)
          .maybeSingle();

        if (sellerData) {
          shopData = sellerData;
          type = 'seller';
        } else {
          const { data: affiliateData } = await supabase
            .from('affiliate_shops')
            .select('*')
            .eq('shop_slug', slug)
            .maybeSingle();
          shopData = affiliateData;
          type = 'affiliate';
        }
      }

      if (!shopData) {
        toast.error('Store not found');
        navigate('/');
        return;
      }

      // Check if user is the owner
      const owner = shopData.user_id === currentUser.id;
      
      if (!owner) {
        toast.error('You do not have permission to access this dashboard');
        navigate(`/shop/${slug}`);
        return;
      }

      setShop(shopData);
      setShopType(type);
      setIsOwner(owner);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      navigate(`/shop/${slug}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!shop || !isOwner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Dashboard - {shop.shop_name} | Flamia</title>
      </Helmet>

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/shop/${slug}`)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Store
              </Button>
              
              <div className="hidden sm:flex items-center gap-2">
                {shop.shop_logo_url ? (
                  <img 
                    src={shop.shop_logo_url} 
                    alt={shop.shop_name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <Store className="w-8 h-8 text-primary" />
                )}
                <div>
                  <h1 className="font-bold text-lg">{shop.shop_name}</h1>
                  <p className="text-xs text-muted-foreground">
                    {shopType === 'seller' ? 'Merchant' : 'Affiliate'} Dashboard
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            {shopType === 'seller' && (
              <>
                <TabsTrigger value="products" className="gap-2">
                  <Package className="w-4 h-4" />
                  <span className="hidden sm:inline">Products</span>
                </TabsTrigger>
                <TabsTrigger value="orders" className="gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden sm:inline">Orders</span>
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Store Status</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Active</div>
                  <p className="text-xs text-muted-foreground">
                    {shop.shop_slug}.flamia.store
                  </p>
                </CardContent>
              </Card>

              {shopType === 'seller' && (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">-</div>
                      <p className="text-xs text-muted-foreground">
                        Listed products
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">-</div>
                      <p className="text-xs text-muted-foreground">
                        All time orders
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Store Views</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">
                    Total visitors
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks to manage your store</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {shopType === 'seller' && (
                  <>
                    <Button
                      variant="outline"
                      className="h-auto flex-col gap-2 py-4"
                      onClick={() => setActiveTab('products')}
                    >
                      <Package className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-semibold">Add Product</div>
                        <div className="text-xs text-muted-foreground">List new items</div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto flex-col gap-2 py-4"
                      onClick={() => setActiveTab('orders')}
                    >
                      <ShoppingBag className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-semibold">View Orders</div>
                        <div className="text-xs text-muted-foreground">Manage orders</div>
                      </div>
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  onClick={() => setActiveTab('settings')}
                >
                  <Settings className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-semibold">Store Settings</div>
                    <div className="text-xs text-muted-foreground">Configure store</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  onClick={() => navigate(`/shop/${slug}`)}
                >
                  <Store className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-semibold">View Storefront</div>
                    <div className="text-xs text-muted-foreground">See public view</div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <StorePerformance shopId={shop.id} shopType={shopType} />
          </TabsContent>

          {/* Products Tab - Seller Only */}
          {shopType === 'seller' && (
            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Product</CardTitle>
                  <CardDescription>List a new product in your store</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductForm businessId={shop.business_id} shopId={shop.id} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Products</CardTitle>
                  <CardDescription>Manage your product listings</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductsList businessId={shop.business_id} />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Orders Tab - Seller Only */}
          {shopType === 'seller' && (
            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Orders</CardTitle>
                  <CardDescription>Manage customer orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <SellerOrdersList shopId={shop.id} />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <StorefrontAnalytics
              shopId={shop.id}
              businessId={shopType === 'seller' ? shop.business_id : undefined}
              shopType={shopType}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {shopType === 'seller' ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Store Settings</CardTitle>
                    <CardDescription>Manage your store information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ShopSettingsForm shop={shop} onUpdate={() => checkAuthAndLoadShop()} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Checkout Settings</CardTitle>
                    <CardDescription>Configure how customers checkout</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CheckoutSettingsForm shop={shop} onUpdate={() => checkAuthAndLoadShop()} />
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Affiliate Shop Settings</CardTitle>
                  <CardDescription>Manage your affiliate store</CardDescription>
                </CardHeader>
                <CardContent>
                  <AffiliateShopSettings shop={shop} onUpdate={() => checkAuthAndLoadShop()} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

