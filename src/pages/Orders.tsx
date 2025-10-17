import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Package, ShoppingBag, Truck } from "lucide-react";
import AppBar from "@/components/AppBar";
import { ExpandableOrderCard } from "@/components/orders/ExpandableOrderCard";
import { useUserRole } from "@/hooks/useUserRole";

interface Order {
  id: string;
  created_at: string;
  description: string;
  delivery_man_id?: string | null;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assigned_at?: string | null;
  user_id?: string | null;
  delivery_address?: string | null;
  total_amount?: number | null;
  delivery_man?: {
    name: string;
    email: string;
  } | null;
}

const Orders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDeliveryMan, loading: roleLoading } = useUserRole();
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'customer' | 'delivery'>('customer');

  useEffect(() => {
    const checkUserAndFetchOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/signin');
          return;
        }
        setUser(user);
        await fetchAllOrders(user.id);
      } catch (error) {
        console.error('Error checking user:', error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive"
        });
        setLoading(false);
      }
    };

    if (!roleLoading) {
      checkUserAndFetchOrders();
    }
  }, [navigate, roleLoading]);

  const fetchAllOrders = async (userId: string) => {
    try {
      setLoading(true);
      console.log('Fetching orders for user:', userId, 'isDeliveryMan:', isDeliveryMan);
      
      let customerCount = 0;
      let deliveryCount = 0;
      
      // Fetch customer orders (orders placed by this user)
      const { data: customerData, error: customerError } = await supabase
        .from('orders')
        .select(`
          id, created_at, description, delivery_man_id, status, 
          assigned_at, user_id, delivery_address, total_amount
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (customerError) {
        console.error('Error fetching customer orders:', customerError);
      } else {
        const transformedCustomerOrders: Order[] = (customerData || []).map(order => ({
          ...order,
          status: (order.status || 'pending') as Order['status']
        }));
        setCustomerOrders(transformedCustomerOrders);
        customerCount = transformedCustomerOrders.length;
        console.log('Customer orders:', customerCount);
      }

      // If user is delivery man, fetch delivery assignments
      if (isDeliveryMan) {
        const { data: deliveryData, error: deliveryError } = await supabase
          .from('orders')
          .select(`
            id, created_at, description, delivery_man_id, status, 
            assigned_at, user_id, delivery_address, total_amount,
            delivery_latitude, delivery_longitude
          `)
          .eq('delivery_man_id', userId)
          .not('delivery_man_id', 'is', null)
          .order('created_at', { ascending: false });

        if (deliveryError) {
          console.error('Error fetching delivery orders:', deliveryError);
        } else {
          const transformedDeliveryOrders: Order[] = (deliveryData || []).map(order => ({
            ...order,
            status: (order.status || 'pending') as Order['status']
          }));
          setDeliveryOrders(transformedDeliveryOrders);
          deliveryCount = transformedDeliveryOrders.length;
          console.log('Delivery orders:', deliveryCount);
          
          // Default to delivery tab if user has deliveries and no customer orders
          if (deliveryCount > 0 && customerCount === 0) {
            setActiveTab('delivery');
          }
        }
      }
    } catch (error: any) {
      console.error('Error in fetchAllOrders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  if (loading || roleLoading) {
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

  // Render single section for regular users
  if (!isDeliveryMan) {
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
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {customerOrders.length} {customerOrders.length === 1 ? 'order' : 'orders'}
                </p>
              </div>
            </div>

            {customerOrders.length === 0 ? (
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
                {customerOrders.map((order) => (
                  <ExpandableOrderCard 
                    key={order.id} 
                    order={order} 
                    userRole="user"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // Render tabbed view for delivery men who also place orders
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
              <h1 className="text-xl sm:text-2xl font-bold">Orders</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {customerOrders.length} orders • {deliveryOrders.length} deliveries
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'customer' | 'delivery')}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="customer" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                My Orders ({customerOrders.length})
              </TabsTrigger>
              <TabsTrigger value="delivery" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                My Deliveries ({deliveryOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="customer">
              {customerOrders.length === 0 ? (
                <Card className="p-6 text-center">
                  <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
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
                  {customerOrders.map((order) => (
                    <ExpandableOrderCard 
                      key={order.id} 
                      order={order} 
                      userRole="user"
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="delivery">
              {deliveryOrders.length === 0 ? (
                <Card className="p-6 text-center">
                  <Truck className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <h3 className="text-base font-semibold mb-1">No deliveries yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Assigned deliveries will appear here
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {deliveryOrders.map((order) => (
                    <ExpandableOrderCard 
                      key={order.id} 
                      order={order} 
                      userRole="delivery_man"
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Orders;
