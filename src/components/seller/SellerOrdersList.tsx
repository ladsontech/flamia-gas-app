import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchSellerOrders, 
  updateSellerOrderStatus, 
  type SellerOrderWithDetails 
} from '@/services/sellerOrderService';
import { MessageCircle, Package, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface SellerOrdersListProps {
  shopId: string;
}

export const SellerOrdersList = ({ shopId }: SellerOrdersListProps) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<SellerOrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [shopId]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchSellerOrders(shopId);
      setOrders(data);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    orderId: string,
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  ) => {
    try {
      setUpdatingOrderId(orderId);
      await updateSellerOrderStatus(orderId, status);
      await loadOrders();
      toast({
        title: 'Status updated',
        description: `Order marked as ${status}`,
      });
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      pending: { variant: 'secondary', icon: Clock },
      confirmed: { variant: 'default', icon: Package },
      completed: { variant: 'default', icon: CheckCircle },
      cancelled: { variant: 'destructive', icon: XCircle },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  const getCheckoutBadge = (checkoutMethod?: string) => {
    if (checkoutMethod === 'whatsapp') {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <MessageCircle className="w-3 h-3 mr-1" />
          WhatsApp
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <Package className="w-3 h-3 mr-1" />
        Flamia
      </Badge>
    );
  };

  const filterOrders = (filter: 'all' | 'whatsapp' | 'flamia') => {
    if (filter === 'all') return orders;
    if (filter === 'whatsapp') {
      return orders.filter(o => o.order?.checkout_method === 'whatsapp');
    }
    return orders.filter(o => o.order?.checkout_method === 'flamia');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const OrderCard = ({ order }: { order: SellerOrderWithDetails }) => (
    <Card key={order.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Product Image */}
          {order.business_product?.image_url && (
            <img
              src={order.business_product.image_url}
              alt={order.business_product.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
          )}

          {/* Order Details */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold">{order.business_product?.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Order ID: {order.order_id.slice(0, 8)}
                </p>
              </div>
              <div className="flex flex-col gap-1 items-end">
                {getStatusBadge(order.status)}
                {getCheckoutBadge(order.order?.checkout_method)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Quantity:</span> {order.quantity}
              </div>
              <div>
                <span className="text-muted-foreground">Total:</span> UGX {order.total_price.toLocaleString()}
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>{' '}
                {format(new Date(order.created_at), 'MMM dd, yyyy')}
              </div>
              {order.seller_commission > 0 && (
                <div>
                  <span className="text-muted-foreground">Commission:</span> UGX {order.seller_commission.toLocaleString()}
                </div>
              )}
            </div>

            {/* WhatsApp Order Data */}
            {order.whatsapp_order_data && (
              <div className="text-sm bg-green-50 p-2 rounded">
                <span className="font-medium">WhatsApp Order</span>
                {order.whatsapp_order_data.message && (
                  <p className="text-muted-foreground">{order.whatsapp_order_data.message}</p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {order.status === 'pending' && (
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                  disabled={updatingOrderId === order.id}
                >
                  {updatingOrderId === order.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Confirm'
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                  disabled={updatingOrderId === order.id}
                >
                  Cancel
                </Button>
              </div>
            )}
            {order.status === 'confirmed' && (
              <Button
                size="sm"
                onClick={() => handleStatusUpdate(order.id, 'completed')}
                disabled={updatingOrderId === order.id}
              >
                {updatingOrderId === order.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Mark Complete'
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>Manage your shop orders from all channels</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
            <TabsTrigger value="whatsapp">
              <MessageCircle className="w-4 h-4 mr-1" />
              WhatsApp ({filterOrders('whatsapp').length})
            </TabsTrigger>
            <TabsTrigger value="flamia">
              <Package className="w-4 h-4 mr-1" />
              Flamia ({filterOrders('flamia').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No orders yet
              </div>
            ) : (
              filterOrders('all').map(order => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>

          <TabsContent value="whatsapp">
            {filterOrders('whatsapp').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No WhatsApp orders yet
              </div>
            ) : (
              filterOrders('whatsapp').map(order => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>

          <TabsContent value="flamia">
            {filterOrders('flamia').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No Flamia orders yet
              </div>
            ) : (
              filterOrders('flamia').map(order => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

