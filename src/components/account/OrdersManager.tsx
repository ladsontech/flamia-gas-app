import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Clock, Package, Truck, CheckCircle, User, MapPin } from "lucide-react";
import { format } from "date-fns";

interface Order {
  id: string;
  created_at: string;
  description: string;
  status: string;
  delivery_man_id?: string | null;
  assigned_at?: string | null;
  user_id?: string;
}

interface DeliveryMan {
  id: string;
  name: string;
  email: string;
}

interface OrdersManagerProps {
  userRole: 'super_admin' | 'business_owner' | 'delivery_man' | 'user';
  userId: string;
}

const OrdersManager = ({ userRole, userId }: OrdersManagerProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryMen, setDeliveryMen] = useState<DeliveryMan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [userRole, userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders based on user role
      let ordersQuery = supabase.from('orders').select('*');
      
      if (userRole === 'delivery_man') {
        ordersQuery = ordersQuery.eq('delivery_man_id', userId);
      }
      // For business_owner, we rely on RLS policy to filter business orders
      // For super_admin, we get all orders
      
      const { data: ordersData, error: ordersError } = await ordersQuery
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      
      setOrders(ordersData || []);

      // Fetch delivery men if admin
      if (userRole === 'super_admin') {
        // First get delivery men user IDs
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'delivery_man');
        
        if (roleError) throw roleError;

        if (roleData && roleData.length > 0) {
          // Then get their profiles
          const userIds = roleData.map(item => item.user_id);
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, display_name, full_name')
            .in('id', userIds);
          
          if (profileError) throw profileError;
          
          setDeliveryMen((profileData || []).map(profile => ({
            id: profile.id,
            name: profile.display_name || profile.full_name || 'Unknown',
            email: ''
          })));
        }
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignOrder = async (orderId: string, deliveryManId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          delivery_man_id: deliveryManId, 
          status: 'assigned',
          assigned_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order assigned successfully"
      });
      
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign order",
        variant: "destructive"
      });
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order status updated successfully"
      });
      
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'assigned': return <User className="h-4 w-4" />;
      case 'in_progress': return <Truck className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'assigned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const extractOrderInfo = (description: string) => {
    const lines = description.split('\n');
    const info: any = {};
    
    lines.forEach(line => {
      if (line.includes('Brand:')) info.brand = line.split('Brand:')[1]?.trim();
      if (line.includes('Size:')) info.size = line.split('Size:')[1]?.trim();
      if (line.includes('Contact:')) info.contact = line.split('Contact:')[1]?.trim();
      if (line.includes('Address:')) info.address = line.split('Address:')[1]?.trim();
    });
    
    return info;
  };

  if (loading) {
    return <div className="text-center">Loading orders...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {userRole === 'super_admin' ? 'All Orders' : 
           userRole === 'business_owner' ? 'Business Orders' :
           userRole === 'delivery_man' ? 'My Deliveries' : 'My Orders'}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter:</span>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No orders found.
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const orderInfo = extractOrderInfo(order.description);
            const deliveryMan = deliveryMen.find(dm => dm.id === order.delivery_man_id);
            
            return (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-sm font-medium">
                        Order #{order.id.slice(-8)}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {order.status?.replace('_', ' ') || 'pending'}
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {orderInfo.brand && (
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>{orderInfo.brand} - {orderInfo.size}</span>
                      </div>
                    )}
                    {orderInfo.contact && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{orderInfo.contact}</span>
                      </div>
                    )}
                    {orderInfo.address && (
                      <div className="flex items-start gap-2 col-span-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm break-words">{orderInfo.address}</span>
                      </div>
                    )}
                    {deliveryMan && (
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span>{deliveryMan.name}</span>
                      </div>
                    )}
                  </div>

                  {userRole === 'super_admin' && (
                    <div className="flex gap-2 pt-2">
                      {order.status === 'pending' && deliveryMen.length > 0 && (
                        <Select onValueChange={(value) => handleAssignOrder(order.id, value)}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Assign to delivery man" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border shadow-md z-50">
                            {deliveryMen.map((dm) => (
                              <SelectItem key={dm.id} value={dm.id}>
                                {dm.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {order.status === 'pending' && deliveryMen.length === 0 && (
                        <span className="text-sm text-muted-foreground">No delivery men available</span>
                      )}
                    </div>
                  )}

                  {userRole === 'delivery_man' && order.status !== 'completed' && (
                    <div className="flex gap-2 pt-2">
                      {order.status === 'assigned' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleUpdateStatus(order.id, 'in_progress')}
                        >
                          Start Delivery
                        </Button>
                      )}
                      {order.status === 'in_progress' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleUpdateStatus(order.id, 'completed')}
                        >
                          Mark as Completed
                        </Button>
                      )}
                    </div>
                  )}

                  {userRole === 'super_admin' && order.status !== 'completed' && (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleUpdateStatus(order.id, 'completed')}
                        variant="outline"
                      >
                        Mark as Completed
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrdersManager;