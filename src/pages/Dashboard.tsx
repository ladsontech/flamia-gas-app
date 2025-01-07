import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/types/order";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { OrdersList } from "@/components/dashboard/OrdersList";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

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
      
      // If not admin, only fetch user's orders
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
      
      // Refresh orders after assignment
      if (userEmail) fetchOrders(userEmail);
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
      
      // Refresh orders after marking as delivered
      if (userEmail) fetchOrders(userEmail);
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
          <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <Flame className="w-8 h-8 text-accent animate-bounce" />
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-white py-6">
      <div className="container max-w-lg mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">
                {isAdmin ? 'Order Management' : 'My Orders'}
              </h1>
              <Flame className="w-5 h-5 text-accent" />
            </div>
          </div>
          {isAdmin ? (
            <p className="text-sm text-muted-foreground">
              Manage and track all customer orders
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Welcome back, {userEmail}
            </p>
          )}
        </motion.div>

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