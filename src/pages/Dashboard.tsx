import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Order } from "@/types/order";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchOrders();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }
    setUserEmail(session.user.email);
  };

  const fetchOrders = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check if user is admin
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('email', session.user.email)
        .single();

      let query = supabase.from('orders').select('*');
      
      // If not admin, only show user's orders
      if (!userData || userData.role !== 'admin') {
        query = query.eq('customer', session.user.email);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
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
      <div className="min-h-screen bg-gradient-to-b from-primary to-white py-12">
        <div className="container">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-white py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">My Orders</h1>
            <p className="text-muted-foreground">Welcome back, {userEmail}</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/')} variant="outline">
              Home
            </Button>
            <Button onClick={handleLogout} variant="ghost">
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <Button onClick={() => navigate('/order')}>Place an Order</Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{order.brand}</h3>
                    <p className="text-sm text-muted-foreground">
                      Ordered on {new Date(order.created_at!).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Details</p>
                    <p>Size: {order.size}</p>
                    <p>Quantity: {order.quantity}</p>
                    <p>Type: {order.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Information</p>
                    <p>Address: {order.address}</p>
                    <p>Phone: {order.phone}</p>
                    {order.delivery_person && (
                      <p>Delivery Person: {order.delivery_person}</p>
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