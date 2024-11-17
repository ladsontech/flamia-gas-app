import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs";
import { LoginForm } from "@/components/admin/LoginForm";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { Order } from "@/types/order";

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const deliveryPersonnel = [
    "Mike Wilson",
    "Sarah Johnson",
    "Tom Brown",
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } else if (data) {
      // Type assertion to ensure the data matches our Order type
      setOrders(data as Order[]);
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const { data, error } = await supabase
        .from('admin_credentials')
        .select('password_hash')
        .single();

      if (error) throw error;

      const isValid = await bcrypt.compare(password, data.password_hash);
      
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
    }

    setAuthLoading(false);
  };

  const assignDelivery = async (orderId: string, deliveryPerson: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'assigned',
        delivery_person: deliveryPerson 
      })
      .eq('id', orderId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to assign delivery",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Order assigned to ${deliveryPerson}`,
      });
      fetchOrders();
    }
  };

  const markAsDelivered = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'delivered' })
      .eq('id', orderId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to mark as delivered",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Order marked as delivered",
      });
      fetchOrders();
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
            <h1 className="text-3xl font-bold">Order Management</h1>
          </div>

          <Card className="glass-card p-6">
            <OrdersTable
              orders={orders}
              deliveryPersonnel={deliveryPersonnel}
              assignDelivery={assignDelivery}
              markAsDelivered={markAsDelivered}
            />
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;