import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { OrderService, OrderWithDetails } from "@/services/orderService";
import { Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ExpandableOrderCard } from "./ExpandableOrderCard";

interface OrderManagementHubProps {
  userRole: 'super_admin' | 'business_owner' | 'delivery_man' | 'user';
  userId: string;
}

export const OrderManagementHub = ({ userRole, userId }: OrderManagementHubProps) => {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    // Set up real-time subscription for orders
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRole, userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const ordersData = await OrderService.fetchOrders(userRole, userId);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading orders...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters - only for delivery man */}
      {userRole === 'delivery_man' && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">My Deliveries</h2>
              <p className="text-sm text-muted-foreground">
                Total: {orders.length} | Filtered: {filteredOrders.length}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All ({orders.length})
              </Button>
              <Button
                size="sm"
                variant={filter === 'assigned' ? 'default' : 'outline'}
                onClick={() => setFilter('assigned')}
              >
                Assigned ({orders.filter(o => o.status === 'assigned').length})
              </Button>
              <Button
                size="sm"
                variant={filter === 'in_progress' ? 'default' : 'outline'}
                onClick={() => setFilter('in_progress')}
              >
                In Progress ({orders.filter(o => o.status === 'in_progress').length})
              </Button>
              <Button
                size="sm"
                variant={filter === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilter('completed')}
              >
                Completed ({orders.filter(o => o.status === 'completed').length})
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders found</h3>
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? userRole === 'delivery_man' ? 'Assigned deliveries will appear here.' : 'Your orders will appear here.'
                : `No ${filter.replace('_', ' ')} orders found.`
              }
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <ExpandableOrderCard 
              key={order.id} 
              order={order} 
              userRole={userRole as 'user' | 'delivery_man'}
            />
          ))}
        </div>
      )}
    </div>
  );
};
