import { useEffect, useState } from "react";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Order } from "@/types/order";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // List of delivery personnel
  const deliveryPersonnel = ["Fahad", "Steven", "Osinya"];

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
        console.error('Error fetching orders:', error);
        toast({
          title: "Error",
          description: "Failed to fetch orders. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const assignDelivery = async (orderId: string, deliveryPerson: string) => {
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

      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error assigning delivery:', error);
      toast({
        title: "Error",
        description: "Failed to assign delivery person",
        variant: "destructive",
      });
    }
  };

  const markAsDelivered = async (orderId: string) => {
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

      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error marking as delivered:', error);
      toast({
        title: "Error",
        description: "Failed to mark order as delivered",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Orders Dashboard</h1>
        <OrdersTable 
          orders={orders} 
          deliveryPersonnel={deliveryPersonnel}
          assignDelivery={assignDelivery}
          markAsDelivered={markAsDelivered}
        />
      </div>
    </div>
  );
};

export default Dashboard;