import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/types/order";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { OrdersList } from "@/components/dashboard/OrdersList";

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }
    setUserEmail(session.user.email);
    fetchOrders(session.user.email);
  };

  const fetchOrders = async (email: string) => {
    try {
      let query = supabase.from('orders').select('*');
      
      // If not admin, only show their own orders
      if (!isAdmin) {
        query = query.eq('customer', email);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
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
      
      fetchOrders(userEmail!);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign delivery",
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
      
      fetchOrders(userEmail!);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark as delivered",
        variant: "destructive",
      });
    }
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary to-white py-6">
        <div className="container">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-white py-6">
      <div className="container max-w-lg mx-auto px-4">
        <div className="mb-4">
          <h1 className="text-xl font-bold mb-1">{isAdmin ? 'All Orders' : 'My Orders'}</h1>
          <p className="text-sm text-muted-foreground">Welcome, {userEmail}</p>
        </div>

        <OrdersList 
          orders={orders}
          isAdmin={isAdmin}
          onAssignDelivery={handleAssignDelivery}
          onMarkDelivered={handleMarkDelivered}
        />
      </div>
    </div>
  );
};

export default Dashboard;