import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Truck, Package, Calendar, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ExpandableOrderCard } from "@/components/orders/ExpandableOrderCard";
import { FlamiaLoader } from "@/components/ui/FlamiaLoader";
import { useNavigate } from "react-router-dom";
import { format, isToday, startOfDay } from "date-fns";

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
      
      // Fetch all orders for this user
      const { data: allData, error: allError } = await supabase
        .from('orders')
        .select('*')
        .or(`user_id.eq.${userId},delivery_man_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (allError) {
        console.error('Error fetching orders:', allError);
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive"
        });
      } else {
        const allOrders = (allData || []).map(order => ({
          ...order,
          status: (order.status || 'pending') as Order['status']
        }));

        // Separate personal orders (as customer) from delivery assignments
        const personalOrders = allOrders.filter(order => 
          order.user_id === userId && order.delivery_man_id !== userId
        );
        
        const assignedDeliveries = allOrders.filter(order => 
          order.delivery_man_id === userId
        );

        setCustomerOrders(personalOrders);
        setDeliveryOrders(assignedDeliveries);
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

  // Calculate daily stats
  const getDailyStats = () => {
    const stats = new Map<string, { date: Date; total: number; in_progress: number; pending: number; completed: number }>();
    
    deliveryOrders.forEach(order => {
      const dateKey = format(startOfDay(new Date(order.created_at)), 'yyyy-MM-dd');
      
      if (!stats.has(dateKey)) {
        stats.set(dateKey, {
          date: startOfDay(new Date(order.created_at)),
          total: 0,
          in_progress: 0,
          pending: 0,
          completed: 0
        });
      }
      
      const stat = stats.get(dateKey)!;
      stat.total++;
      
      if (order.status === 'in_progress') stat.in_progress++;
      else if (order.status === 'assigned' || order.status === 'pending') stat.pending++;
      else if (order.status === 'completed') stat.completed++;
    });
    
    // Sort by date (today first)
    return Array.from(stats.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  // Sort orders by priority: in_progress > assigned/pending > completed
  const sortOrdersByPriority = (orders: Order[]) => {
    return [...orders].sort((a, b) => {
      const priorityMap = {
        'in_progress': 1,
        'assigned': 2,
        'pending': 2,
        'completed': 3,
        'cancelled': 4
      };
      
      const aPriority = priorityMap[a.status || 'pending'];
      const bPriority = priorityMap[b.status || 'pending'];
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // If same priority, sort by date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  };

  const dailyStats = getDailyStats();
  const sortedDeliveryOrders = sortOrdersByPriority(deliveryOrders);

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

      {/* Daily Statistics */}
      {dailyStats.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground px-1">Daily Statistics</h3>
          {dailyStats.map((stat) => (
            <Card key={format(stat.date, 'yyyy-MM-dd')} className={isToday(stat.date) ? 'border-primary shadow-sm' : ''}>
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">
                      {isToday(stat.date) ? 'Today' : format(stat.date, 'MMM d, yyyy')}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-primary">{stat.total} orders</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-orange-50 rounded p-2 text-center">
                    <div className="font-semibold text-orange-600">{stat.in_progress}</div>
                    <div className="text-muted-foreground">In Progress</div>
                  </div>
                  <div className="bg-yellow-50 rounded p-2 text-center">
                    <div className="font-semibold text-yellow-600">{stat.pending}</div>
                    <div className="text-muted-foreground">Pending</div>
                  </div>
                  <div className="bg-green-50 rounded p-2 text-center">
                    <div className="font-semibold text-green-600">{stat.completed}</div>
                    <div className="text-muted-foreground">Completed</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

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
              <h3 className="text-base font-semibold mb-1">No personal orders yet</h3>
              <Button onClick={() => navigate('/order')} size="sm" className="mt-2">
                Place an Order
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {customerOrders.map((order) => (
                <ExpandableOrderCard 
                  key={order.id} 
                  order={order} 
                  userRole="user"
                  onUpdate={fetchAllOrders}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="deliveries" className="space-y-3 mt-4">
          {deliveryOrders.length === 0 ? (
            <Card className="p-6 text-center">
              <Truck className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-base font-semibold mb-1">No active deliveries</h3>
            </Card>
          ) : (
            <div className="space-y-3">
              {sortedDeliveryOrders.map((order) => (
                <ExpandableOrderCard 
                  key={order.id} 
                  order={order} 
                  userRole="delivery_man"
                  onUpdate={fetchAllOrders}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
