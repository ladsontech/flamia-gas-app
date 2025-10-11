import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import AppBar from "@/components/AppBar";

interface Order {
  id: string;
  created_at: string;
  description: string;
  delivery_man_id?: string | null;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  assigned_at?: string | null;
  user_id?: string | null;
}

const Orders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);
      await fetchOrders(user.id);
    };

    checkUser();
  }, [navigate]);

  const fetchOrders = async (userId: string) => {
    try {
      setLoading(true);
      console.log('Fetching orders for user:', userId);
      
      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, description, delivery_man_id, status, assigned_at, user_id')
        .eq('user_id', userId) // Filter orders by user_id
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
      
      console.log('Fetched orders:', data);
      
      // Transform database orders with simple mapping
      const transformedOrders: Order[] = [];
      
      if (data) {
        data.forEach((dbOrder) => {
          const validStatuses = ['assigned', 'in_progress', 'completed'];
          const order: Order = {
            id: dbOrder.id,
            created_at: dbOrder.created_at,
            description: dbOrder.description,
            delivery_man_id: dbOrder.delivery_man_id,
            status: validStatuses.includes(dbOrder.status) 
              ? dbOrder.status as 'assigned' | 'in_progress' | 'completed'
              : 'pending',
            assigned_at: dbOrder.assigned_at,
            user_id: dbOrder.user_id
          };
          transformedOrders.push(order);
        });
      }
      
      setOrders(transformedOrders);
    } catch (error: any) {
      console.error('Error in fetchOrders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <>
        <AppBar />
        <div className="pt-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AppBar />
      <div className="pt-20 px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">My Orders</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Order history</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <Card className="p-6 text-center">
              <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-base font-semibold mb-1">No orders yet</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Place your first order!
              </p>
              <Button onClick={() => navigate('/order')} size="sm">
                Order Now
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Card key={order.id} className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(order.status)}
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(order.created_at), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm font-medium line-clamp-2">{order.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Orders;
