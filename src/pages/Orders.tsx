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
import { FlamiaLoader } from "@/components/ui/FlamiaLoader";

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

  // For delivery men, redirect to delivery page (unified experience)
  useEffect(() => {
    if (!roleLoading && isDeliveryMan) {
      navigate('/delivery');
    }
  }, [isDeliveryMan, roleLoading, navigate]);

  // Fetch only customer orders for regular users
  useEffect(() => {
    const checkUserAndFetchOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/signin');
          return;
        }
        setUser(user);
        await fetchCustomerOrders(user.id);
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

    if (!roleLoading && !isDeliveryMan) {
      checkUserAndFetchOrders();
    }
  }, [navigate, roleLoading, isDeliveryMan]);

  const fetchCustomerOrders = async (userId: string) => {
    try {
      setLoading(true);
      console.log('Fetching customer orders for user:', userId);
      
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
        throw customerError;
      }

      const transformedCustomerOrders: Order[] = (customerData || []).map(order => ({
        ...order,
        status: (order.status || 'pending') as Order['status']
      }));
      setCustomerOrders(transformedCustomerOrders);
      console.log('Customer orders loaded:', transformedCustomerOrders.length);
    } catch (error: any) {
      console.error('Error in fetchCustomerOrders:', error);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <FlamiaLoader message="Loading your orders..." />
        </div>
      </div>
    );
  }

  // Regular users (non-delivery men) see their customer orders
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
};

export default Orders;
