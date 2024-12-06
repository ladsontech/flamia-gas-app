import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Order } from "@/types/order";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
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
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('email', email)
        .maybeSingle(); // Changed from single() to maybeSingle()

      let query = supabase.from('orders').select('*');
      
      // If no user data or not admin, only show their own orders
      if (!userData || userData.role !== 'admin') {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
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
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-1">My Orders</h1>
          <p className="text-sm text-muted-foreground">Welcome back, {userEmail}</p>
        </div>

        {orders.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-4 text-sm">No orders yet</p>
            <Button 
              onClick={() => navigate('/order')}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Place an Order
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-1">
                    <h3 className="font-medium text-sm">{order.brand}</h3>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(order.created_at!), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="mt-3 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span className="text-muted-foreground">Size:</span>
                    <span>{order.size}</span>
                    <span className="text-muted-foreground">Quantity:</span>
                    <span>{order.quantity}</span>
                    <span className="text-muted-foreground">Type:</span>
                    <span>{order.type}</span>
                  </div>
                  
                  <div className="border-t pt-2 mt-2">
                    <p className="text-xs text-muted-foreground mb-1">Delivery Details</p>
                    <p className="text-xs">{order.address}</p>
                    <p className="text-xs">{order.phone}</p>
                    {order.delivery_person && (
                      <p className="text-xs mt-1">Delivery Person: {order.delivery_person}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;