import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Truck, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ExpandableOrderCard } from "@/components/orders/ExpandableOrderCard";
import { FlamiaLoader } from "@/components/ui/FlamiaLoader";
import { useNavigate } from "react-router-dom";

interface Order {
  id: string;
  created_at: string;
  description: string;
  delivery_man_id?: string | null;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assigned_at?: string | null;
  user_id?: string | null;
  delivery_address?: string | null;
  total_amount?: number | null;
  delivery_latitude?: number | null;
  delivery_longitude?: number | null;
}

interface DeliveryManSectionProps {
  userId: string;
}

export const DeliveryManSection = ({ userId }: DeliveryManSectionProps) => {
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'deliveries'>('deliveries');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllOrders();
    
    // Real-time subscription
    const channel = supabase
      .channel('delivery-man-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchAllOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch customer orders (personal orders placed by this delivery man)
      const { data: customerData, error: customerError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (customerError) {
        console.error('Error fetching customer orders:', customerError);
      } else {
        const transformedCustomerOrders: Order[] = (customerData || []).map(order => ({
          ...order,
          status: (order.status || 'pending') as Order['status']
        }));
        setCustomerOrders(transformedCustomerOrders);
      }

      // Fetch delivery assignments
      const { data: deliveryData, error: deliveryError } = await supabase
        .from('orders')
        .select('*')
        .eq('delivery_man_id', userId)
        .not('delivery_man_id', 'is', null)
        .order('created_at', { ascending: false });

      if (deliveryError) {
        console.error('Error fetching delivery orders:', deliveryError);
      } else {
        const transformedDeliveryOrders: Order[] = (deliveryData || []).map(order => ({
          ...order,
          status: (order.status || 'pending') as Order['status']
        }));
        setDeliveryOrders(transformedDeliveryOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <FlamiaLoader message="Loading your data..." />;
  }

  return (
    <div className="space-y-4">
      {/* Quick action to view map */}
      <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">Delivery Map</h3>
            <p className="text-xs text-muted-foreground">
              View all deliveries on map with navigation
            </p>
          </div>
          <Button 
            size="sm"
            onClick={() => navigate('/delivery')}
            className="gap-2"
          >
            <Truck className="h-4 w-4" />
            Open Map
          </Button>
        </div>
      </Card>

      {/* Tabs for Orders and Deliveries */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'orders' | 'deliveries')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            My Orders ({customerOrders.length})
          </TabsTrigger>
          <TabsTrigger value="deliveries" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            My Deliveries ({deliveryOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-3 mt-4">
          {customerOrders.length === 0 ? (
            <Card className="p-6 text-center">
              <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-base font-semibold mb-1">No personal orders</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Orders you place will appear here
              </p>
              <Button onClick={() => navigate('/order')} size="sm">
                Place Order
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {customerOrders.map((order) => (
                <ExpandableOrderCard 
                  key={order.id} 
                  order={order} 
                  userRole="user"
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="deliveries" className="space-y-3 mt-4">
          {deliveryOrders.length === 0 ? (
            <Card className="p-6 text-center">
              <Truck className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-base font-semibold mb-1">No deliveries assigned</h3>
              <p className="text-sm text-muted-foreground">
                Assigned deliveries will appear here
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {deliveryOrders.map((order) => (
                <ExpandableOrderCard 
                  key={order.id} 
                  order={order} 
                  userRole="delivery_man"
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
