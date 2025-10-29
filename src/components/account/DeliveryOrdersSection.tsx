import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Calendar } from "lucide-react";
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

interface DeliveryOrdersSectionProps {
  userId: string;
}

export const DeliveryOrdersSection = ({ userId }: DeliveryOrdersSectionProps) => {
  const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDeliveryOrders();
    
    // Real-time subscription
    const channel = supabase
      .channel('delivery-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchDeliveryOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchDeliveryOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch delivery assignments only
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('delivery_man_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching delivery orders:', error);
        toast({
          title: "Error",
          description: "Failed to load delivery orders",
          variant: "destructive"
        });
      } else {
        const orders = (data || []).map(order => ({
          ...order,
          status: (order.status || 'pending') as Order['status']
        }));
        
        setDeliveryOrders(orders);
      }
    } catch (error) {
      console.error('Error fetching delivery orders:', error);
      toast({
        title: "Error",
        description: "Failed to load delivery orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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

  // Group orders by date
  const getOrdersByDate = () => {
    const grouped = new Map<string, Order[]>();
    
    deliveryOrders.forEach(order => {
      const dateKey = format(startOfDay(new Date(order.created_at)), 'yyyy-MM-dd');
      
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      
      grouped.get(dateKey)!.push(order);
    });
    
    // Sort each day's orders by priority
    grouped.forEach((orders, date) => {
      grouped.set(date, sortOrdersByPriority(orders));
    });
    
    // Convert to array and sort by date (today first)
    return Array.from(grouped.entries())
      .map(([dateKey, orders]) => ({
        date: startOfDay(new Date(dateKey)),
        dateKey,
        orders,
        stats: {
          total: orders.length,
          in_progress: orders.filter(o => o.status === 'in_progress').length,
          pending: orders.filter(o => o.status === 'assigned' || o.status === 'pending').length,
          completed: orders.filter(o => o.status === 'completed').length,
        }
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const ordersByDate = getOrdersByDate();

  if (loading) {
    return <FlamiaLoader message="Loading deliveries..." />;
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

      {deliveryOrders.length === 0 ? (
        <Card className="p-6 text-center">
          <Truck className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <h3 className="text-base font-semibold mb-1">No active deliveries</h3>
        </Card>
      ) : (
        <div className="space-y-4">
          {ordersByDate.map((dayGroup) => (
            <div key={dayGroup.dateKey} className="space-y-2">
              {/* Daily Header with Stats */}
              <Card className={isToday(dayGroup.date) ? 'border-primary shadow-sm' : ''}>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-sm">
                        {isToday(dayGroup.date) ? 'Today' : format(dayGroup.date, 'MMM d, yyyy')}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-primary">{dayGroup.stats.total} orders</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-orange-50 dark:bg-orange-950/20 rounded p-2 text-center">
                      <div className="font-semibold text-orange-600 dark:text-orange-400">{dayGroup.stats.in_progress}</div>
                      <div className="text-muted-foreground">In Progress</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded p-2 text-center">
                      <div className="font-semibold text-yellow-600 dark:text-yellow-400">{dayGroup.stats.pending}</div>
                      <div className="text-muted-foreground">Pending</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 rounded p-2 text-center">
                      <div className="font-semibold text-green-600 dark:text-green-400">{dayGroup.stats.completed}</div>
                      <div className="text-muted-foreground">Completed</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Orders for this day */}
              <div className="space-y-2 pl-2">
                {dayGroup.orders.map((order) => (
                  <ExpandableOrderCard 
                    key={order.id} 
                    order={order} 
                    userRole="delivery_man"
                    onUpdate={fetchDeliveryOrders}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
