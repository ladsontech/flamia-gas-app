import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
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

interface CustomerOrdersSectionProps {
  userId: string;
}

export const CustomerOrdersSection = ({ userId }: CustomerOrdersSectionProps) => {
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomerOrders();
    
    // Real-time subscription
    const channel = supabase
      .channel('customer-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchCustomerOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchCustomerOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch personal orders only (where user is the customer, not the delivery person)
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customer orders:', error);
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive"
        });
      } else {
        // Filter out delivery assignments (where user is delivery person)
        const customerOrders = (data || [])
          .filter(order => order.delivery_man_id !== userId)
          .map(order => ({
            ...order,
            status: (order.status || 'pending') as Order['status']
          }));
        
        setCustomerOrders(customerOrders);
      }
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading is now handled by parent Account page
  if (loading) {
    return null;
  }

  return (
    <div className="space-y-3">
      {customerOrders.length === 0 ? (
        <Card className="p-6 text-center">
          <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <h3 className="text-base font-semibold mb-1">No orders yet</h3>
          <p className="text-sm text-muted-foreground mb-3">Place your first order to get started</p>
          <Button onClick={() => navigate('/order')} size="sm">
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
              onUpdate={fetchCustomerOrders}
            />
          ))}
        </div>
      )}
    </div>
  );
};
