import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { LoginForm } from "@/components/admin/LoginForm";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { HotDealsManager } from "@/components/admin/HotDealsManager";
import { Order } from "@/types/order";
import { verifyAdminPassword, fetchOrders, updateOrderStatus } from "@/services/database";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const deliveryPersonnel = [
    "Osinya",
    "Fahad",
    "Anold",
    "Steven",
    "Boda"
  ];

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('email', session.user.email)
      .single();

    if (userData?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    setIsAuthenticated(true);
    loadOrders();
  };

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const isValid = await verifyAdminPassword(password);
      
      if (isValid) {
        setIsAuthenticated(true);
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Invalid password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Authentication failed",
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const assignDelivery = async (orderId: string, deliveryPerson: string) => {
    try {
      await updateOrderStatus(orderId, 'assigned', deliveryPerson);
      toast({
        title: "Success",
        description: `Order assigned to ${deliveryPerson}`,
      });
      loadOrders();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign delivery",
        variant: "destructive",
      });
    }
  };

  const markAsDelivered = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'delivered');
      toast({
        title: "Success",
        description: "Order marked as delivered",
      });
      loadOrders();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark as delivered",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginForm
        password={password}
        setPassword={setPassword}
        handleLogin={handleLogin}
        authLoading={authLoading}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary to-white py-12">
        <div className="container">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-white py-12">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-8"
        >
          <div className="text-center">
            <span className="px-4 py-1 bg-accent text-accent-foreground rounded-full text-sm mb-4 inline-block">
              Admin Dashboard
            </span>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Hot Deals Management</h2>
              <HotDealsManager />
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold mb-4">Order Management</h2>
              <OrdersTable
                orders={orders}
                deliveryPersonnel={deliveryPersonnel}
                assignDelivery={assignDelivery}
                markAsDelivered={markAsDelivered}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;