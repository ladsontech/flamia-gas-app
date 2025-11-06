import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Package,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StorefrontAnalyticsProps {
  shopId: string;
  businessId?: string;
  shopType: 'seller' | 'affiliate';
}

export const StorefrontAnalytics = ({ shopId, businessId, shopType }: StorefrontAnalyticsProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCommissions: 0,
    avgOrderValue: 0,
    productsCount: 0,
    affiliatesCount: 0,
    conversionRate: 0,
    recentOrders: [] as any[]
  });

  useEffect(() => {
    loadAnalytics();
  }, [shopId, businessId, shopType]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      if (shopType === 'seller' && businessId) {
        // Seller Analytics
        const { count: productsCount } = await supabase
          .from('business_products')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', businessId);

        // Get orders for this seller's products
        const { data: ordersData } = await supabase
          .from('orders')
          .select('total_amount, status, created_at, description')
          .ilike('description', `%${shopId}%`)
          .in('status', ['completed', 'pending', 'in_transit'])
          .order('created_at', { ascending: false })
          .limit(10);

        const totalOrders = ordersData?.length || 0;
        const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Count affiliates promoting products
        const { count: affiliatesCount } = await supabase
          .from('affiliate_shop_products')
          .select('business_product_id', { count: 'exact', head: true })
          .in('business_product_id', 
            (await supabase
              .from('business_products')
              .select('id')
              .eq('business_id', businessId)
            ).data?.map(p => p.id) || []
          );

        setAnalytics({
          totalOrders,
          totalRevenue,
          totalCommissions: 0,
          avgOrderValue,
          productsCount: productsCount || 0,
          affiliatesCount: affiliatesCount || 0,
          conversionRate: 0,
          recentOrders: ordersData || []
        });
      } else if (shopType === 'affiliate') {
        // Affiliate Analytics
        const { data: affiliateOrders } = await supabase
          .from('affiliate_orders')
          .select('commission_amount, status, created_at, order_id')
          .eq('affiliate_shop_id', shopId)
          .order('created_at', { ascending: false })
          .limit(10);

        const totalOrders = affiliateOrders?.length || 0;
        const totalCommissions = affiliateOrders
          ?.filter(o => o.status === 'approved')
          .reduce((sum, order) => sum + order.commission_amount, 0) || 0;

        const { count: productsCount } = await supabase
          .from('affiliate_shop_products')
          .select('*', { count: 'exact', head: true })
          .eq('affiliate_shop_id', shopId);

        setAnalytics({
          totalOrders,
          totalRevenue: 0,
          totalCommissions,
          avgOrderValue: totalOrders > 0 ? totalCommissions / totalOrders : 0,
          productsCount: productsCount || 0,
          affiliatesCount: 0,
          conversionRate: 0,
          recentOrders: affiliateOrders || []
        });
      }
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {shopType === 'seller' ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-lg sm:text-2xl font-bold">
                  UGX {(analytics.totalRevenue / 1000).toFixed(0)}K
                </div>
                <p className="text-xs text-gray-500">Total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-lg sm:text-2xl font-bold">{analytics.totalOrders}</div>
                <p className="text-xs text-gray-500">Total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Products</CardTitle>
                <Package className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-lg sm:text-2xl font-bold">{analytics.productsCount}</div>
                <p className="text-xs text-gray-500">Listed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Affiliates</CardTitle>
                <Users className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-lg sm:text-2xl font-bold">{analytics.affiliatesCount}</div>
                <p className="text-xs text-gray-500">Promoting</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Commissions</CardTitle>
                <DollarSign className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-lg sm:text-2xl font-bold">
                  UGX {(analytics.totalCommissions / 1000).toFixed(0)}K
                </div>
                <p className="text-xs text-gray-500">Earned</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-lg sm:text-2xl font-bold">{analytics.totalOrders}</div>
                <p className="text-xs text-gray-500">Promoted</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Products</CardTitle>
                <Package className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-lg sm:text-2xl font-bold">{analytics.productsCount}</div>
                <p className="text-xs text-gray-500">Promoting</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Avg/Order</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-lg sm:text-2xl font-bold">
                  UGX {analytics.avgOrderValue > 0 ? (analytics.avgOrderValue / 1000).toFixed(0) : 0}K
                </div>
                <p className="text-xs text-gray-500">Commission</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Activity */}
      {analytics.recentOrders.length > 0 && (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-3">
              {analytics.recentOrders.slice(0, 5).map((order, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {shopType === 'seller' ? 'Order' : 'Commission'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-orange-600">
                      UGX {shopType === 'seller' 
                        ? (order.total_amount || 0).toLocaleString()
                        : (order.commission_amount || 0).toLocaleString()}
                    </p>
                    <Badge 
                      variant={order.status === 'completed' || order.status === 'approved' ? 'default' : 'secondary'}
                      className="text-xs mt-1"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

