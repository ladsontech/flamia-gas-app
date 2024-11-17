import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs";

interface Order {
  id: string;
  customer: string;
  phone: string;
  address: string;
  brand: string;
  size: string;
  quantity: number;
  type: "new" | "refill";
  status: "pending" | "assigned" | "delivered";
  delivery_person?: string;
  order_date: string;
}

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
    } else {
      setOrders(data || []);
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
      <div className="min-h-screen bg-gradient-to-b from-primary to-white py-12">
        <div className="container max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6">
              <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Input
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={authLoading}
                >
                  {authLoading ? "Authenticating..." : "Login"}
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer}</div>
                        <div className="text-sm text-muted-foreground">{order.address}</div>
                      </div>
                    </TableCell>
                    <TableCell>{order.phone}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.brand}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.size} x {order.quantity} ({order.type})
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "assigned"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {order.status === "pending" && (
                        <div className="flex gap-2">
                          {deliveryPersonnel.map((person) => (
                            <Button
                              key={person}
                              variant="outline"
                              size="sm"
                              onClick={() => assignDelivery(order.id, person)}
                              className="hover:bg-accent hover:text-accent-foreground"
                            >
                              Assign to {person}
                            </Button>
                          ))}
                        </div>
                      )}
                      {order.status === "assigned" && (
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">
                            Assigned to {order.delivery_person}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => markAsDelivered(order.id)}
                            className="bg-green-500 text-white hover:bg-green-600"
                          >
                            Mark Delivered
                          </Button>
                        </div>
                      )}
                      {order.status === "delivered" && (
                        <span className="text-sm text-green-600 font-medium">
                          Completed
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;