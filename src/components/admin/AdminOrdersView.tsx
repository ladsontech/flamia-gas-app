import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { OrdersTable } from "./OrdersTable";
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/types/order";
import { useNavigate } from "react-router-dom";

export const AdminOrdersView = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const deliveryPersonnel = [
    "Fahad",
    "Osingya",
    "Peter",
    "Steven"
  ];

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('admin')
        .eq('id', user.id)
        .maybeSingle();

      if (userError || !userData || userData?.admin !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You need admin privileges to view this page",
          variant: "destructive",
        });
        navigate('/');
        return;
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/');
    }
  };

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
      
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
    loadOrders();
  }, []);

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
      loadOrders();
    } catch (error) {
      console.error('Error assigning delivery:', error);
      toast({
        title: "Error",
        description: "Failed to assign delivery",
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
      loadOrders();
    } catch (error) {
      console.error('Error marking as delivered:', error);
      toast({
        title: "Error",
        description: "Failed to mark as delivered",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Order Management</h2>
      <OrdersTable
        orders={orders}
        deliveryPersonnel={deliveryPersonnel}
        assignDelivery={assignDelivery}
        markAsDelivered={markAsDelivered}
      />
    </div>
  );
};