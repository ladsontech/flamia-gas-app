import { useState, useEffect } from "react";
import { AdminOrdersView } from "@/components/admin/AdminOrdersView";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Order } from "@/types/order";
import { Flame } from "lucide-react";

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
        <AdminOrdersView orders={orders} onOrdersUpdate={fetchOrders} />
      </div>
    </div>
  );
};

export default Admin;