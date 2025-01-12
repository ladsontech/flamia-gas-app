import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Order } from "@/types/order";
import { Flame } from "lucide-react";
import { OrdersList } from "@/components/dashboard/OrdersList";

const Admin = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDelivery = async (orderId: string, deliveryPerson: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'assigned',
          delivery_person: deliveryPerson 
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Order assigned to ${deliveryPerson}`,
      });

      fetchOrders();
    } catch (error) {
      console.error('Error assigning delivery:', error);
      toast({
        title: "Error",
        description: "Failed to assign delivery person",
        variant: "destructive",
      });
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'delivered' })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order marked as delivered",
      });

      fetchOrders();
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      toast({
        title: "Error",
        description: "Failed to mark order as delivered",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/20 to-background">
        <div className="container py-8 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <Flame className="w-8 h-8 text-accent animate-bounce" />
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/20 to-background">
      <div className="container py-8">
        <OrdersList 
          orders={orders} 
          isAdmin={true}
          onAssignDelivery={handleAssignDelivery}
          onMarkDelivered={handleMarkDelivered}
        />
      </div>
    </div>
  );
};

export default Admin;