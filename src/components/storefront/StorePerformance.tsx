import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, ShoppingCart, Eye, DollarSign, Package } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface StorePerformanceProps {
  shopId: string;
  shopType: 'affiliate' | 'seller';
}

interface PerformanceStats {
  totalViews: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
}

export const StorePerformance = ({ shopId, shopType }: StorePerformanceProps) => {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformanceStats();
  }, [shopId]);

  const loadPerformanceStats = async () => {
    try {
      setLoading(true);

      // Placeholder stats - actual implementation would query proper tables
      // This avoids TypeScript errors with tables that may not exist in types yet
      let totalProducts = 0;
      let totalViews = 0;
      let totalOrders = 0;
      let totalRevenue = 0;

      // Try to get basic stats with error handling
      try {
        if (shopType === 'affiliate') {
          const { count } = await supabase
            .from('affiliate_shop_products' as any)
            .select('*', { count: 'exact', head: true })
            .eq('affiliate_shop_id', shopId)
            .eq('is_active', true);
          totalProducts = count || 0;

          const { data: orders } = await supabase
            .from('affiliate_orders' as any)
            .select('commission_amount, status')
            .eq('affiliate_shop_id', shopId);

          if (orders) {
            totalOrders = orders.filter((o: any) => o.status !== 'cancelled').length;
            totalRevenue = orders
              .filter((o: any) => o.status === 'approved')
              .reduce((sum: number, order: any) => sum + (order.commission_amount || 0), 0);
          }
        } else {
          const { count } = await supabase
            .from('seller_products' as any)
            .select('*', { count: 'exact', head: true })
            .eq('seller_shop_id', shopId)
            .eq('is_active', true);
          totalProducts = count || 0;
        }

        // Try to get view count
        const { count: viewCount } = await supabase
          .from('product_views' as any)
          .select('*', { count: 'exact', head: true });
        totalViews = viewCount || 0;
      } catch (error) {
        console.warn('Could not load some stats:', error);
      }

      setStats({
        totalViews,
        totalOrders,
        totalRevenue,
        totalProducts,
      });
    } catch (error) {
      console.error('Error loading performance stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Store Performance</CardTitle>
          <CardDescription>Loading analytics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const metrics = [
    {
      title: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Product Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: shopType === 'affiliate' ? 'Total Commission' : 'Total Revenue',
      value: `UGX ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Store Performance
        </CardTitle>
        <CardDescription>
          Overview of your store's key metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.title}
              className="flex flex-col items-center text-center p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
            >
              <div className={`p-3 rounded-full ${metric.bgColor} mb-3`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <p className="text-2xl font-bold mb-1">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.title}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
