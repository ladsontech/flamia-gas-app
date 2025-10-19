import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { fetchSellerShopByUser } from '@/services/sellerService';
import type { SellerShop } from '@/types/seller';
import { Package, Store, DollarSign, BarChart3 } from 'lucide-react';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<SellerShop | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadShop = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: 'Authentication required',
            description: 'Please sign in to access your seller dashboard.',
            variant: 'destructive',
          });
          navigate('/signin');
          return;
        }

        setUserId(user.id);
        const sellerShop = await fetchSellerShopByUser(user.id);
        
        if (!sellerShop) {
          toast({
            title: 'No seller shop found',
            description: 'Please apply to become a seller first.',
            variant: 'destructive',
          });
          navigate('/sell');
          return;
        }

        if (!sellerShop.is_approved) {
          toast({
            title: 'Shop pending approval',
            description: 'Your shop application is still under review.',
          });
          navigate('/account');
          return;
        }

        setShop(sellerShop);
      } catch (error: any) {
        console.error('Error loading seller shop:', error);
        toast({
          title: 'Error',
          description: 'Failed to load seller dashboard.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadShop();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return null;
  }

  const nextPaymentDue = shop.next_payment_due ? new Date(shop.next_payment_due) : null;
  const daysUntilPayment = nextPaymentDue 
    ? Math.ceil((nextPaymentDue.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{shop.shop_name}</h1>
            <p className="text-muted-foreground">
              {shop.shop_slug}.flamia.store
            </p>
          </div>
          <Button onClick={() => window.open(`https://${shop.shop_slug}.flamia.store`, '_blank')}>
            View Shop
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Add your first product</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">UGX 0</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Due</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{daysUntilPayment ? `${daysUntilPayment}d` : '-'}</div>
              <p className="text-xs text-muted-foreground">
                {shop.monthly_fee?.toLocaleString()} UGX/month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="settings">Shop Settings</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>Manage your shop products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No products yet</p>
                  <Button>Add Your First Product</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Shop Settings</CardTitle>
                <CardDescription>Customize your shop</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Shop Name</p>
                    <p className="text-sm text-muted-foreground">{shop.shop_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Shop URL</p>
                    <p className="text-sm text-muted-foreground">{shop.shop_slug}.flamia.store</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Tier</p>
                    <p className="text-sm text-muted-foreground capitalize">{shop.tier}</p>
                  </div>
                  {shop.shop_description && (
                    <div>
                      <p className="text-sm font-medium">Description</p>
                      <p className="text-sm text-muted-foreground">{shop.shop_description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>Manage your subscription payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">Monthly Fee</p>
                      <p className="text-2xl font-bold">{shop.monthly_fee?.toLocaleString()} UGX</p>
                    </div>
                    {nextPaymentDue && (
                      <p className="text-sm text-muted-foreground">
                        Next payment due: {nextPaymentDue.toLocaleDateString()}
                        {daysUntilPayment && daysUntilPayment <= 7 && (
                          <span className="text-destructive"> (Due in {daysUntilPayment} days)</span>
                        )}
                      </p>
                    )}
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-medium mb-2">Payment Instructions</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Please make your monthly payment via Mobile Money or Bank Transfer
                    </p>
                    <p className="text-sm">Contact admin for payment details</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SellerDashboard;
