import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { OrderService, OrderWithDetails, DeliveryPersonProfile } from "@/services/orderService";
import { 
  Clock, Package, Truck, CheckCircle, User, MapPin, Phone, Calendar, XCircle,
  DollarSign, TrendingUp, ShoppingCart, Filter, BarChart3
} from "lucide-react";
import { format, isToday, isYesterday, startOfWeek, isThisWeek, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface AdminOrdersDashboardProps {
  userRole: 'super_admin' | 'business_owner' | 'delivery_man' | 'user';
  userId: string;
}

interface OrderStats {
  total: number;
  pending: number;
  assigned: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
}

interface DayGroup {
  date: string;
  displayName: string;
  orders: OrderWithDetails[];
  stats: OrderStats;
}

export const AdminOrdersDashboard = ({ userRole, userId }: AdminOrdersDashboardProps) => {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPersonProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [assigningOrders, setAssigningOrders] = useState<Set<string>>(new Set());
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRole, userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const ordersData = await OrderService.fetchOrders(userRole, userId);
      setOrders(ordersData);

      if (userRole === 'super_admin') {
        const deliveryPersonsData = await OrderService.fetchDeliveryPersons();
        setDeliveryPersons(deliveryPersonsData);
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

  const extractOrderInfo = (description: string) => {
    const info: any = { contact: '', address: '' };
    
    // New format: "Brand SIZE type (Qty: X) - Contact: PHONE - Address: ADDRESS"
    // Extract contact
    const contactMatch = description.match(/Contact:\s*([^-]+?)(?:\s*-|$)/);
    if (contactMatch) {
      info.contact = contactMatch[1].trim();
    }
    
    // Extract address
    const addressMatch = description.match(/Address:\s*(.+?)$/);
    if (addressMatch) {
      info.address = addressMatch[1].trim();
    }
    
    // Extract quantity
    const qtyMatch = description.match(/\(Qty:\s*(\d+)\)/);
    if (qtyMatch) {
      info.quantity = qtyMatch[1];
    }
    
    // Extract brand, size, and type from the beginning
    const mainPart = description.split(' - Contact:')[0];
    const parts = mainPart.split(' ');
    
    if (parts.length >= 2) {
      info.brand = parts[0];
      
      // Look for size pattern (3kg, 6kg, 12kg, etc.)
      const sizeMatch = mainPart.match(/(\d+kg)/i);
      if (sizeMatch) {
        info.size = sizeMatch[1].toUpperCase();
      }
      
      // Determine type
      if (mainPart.toLowerCase().includes('refill')) {
        info.type = 'Refill';
      } else if (mainPart.toLowerCase().includes('full set') || mainPart.toLowerCase().includes('kit')) {
        info.type = 'Full Set';
      } else if (mainPart.toLowerCase().includes('accessory')) {
        info.type = 'Accessory';
      } else if (mainPart.toLowerCase().includes('gadget')) {
        info.type = 'Gadget';
      } else {
        info.type = 'Gas Product';
      }
    }
    
    return info;
  };


  const getProductType = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('3kg') || desc.includes('3 kg')) return '3kg';
    if (desc.includes('6kg') || desc.includes('6 kg')) return '6kg';
    if (desc.includes('12kg') || desc.includes('12 kg')) return '12kg';
    if (desc.includes('13kg') || desc.includes('13 kg')) return '12kg'; // Group 13kg with 12kg
    if (desc.includes('refill')) return 'refill';
    if (desc.includes('full') || desc.includes('kit')) return 'full_kit';
    return 'other';
  };

  const groupOrdersByDay = (orders: OrderWithDetails[]): DayGroup[] => {
    const groups: { [key: string]: OrderWithDetails[] } = {};
    
    orders.forEach(order => {
      const orderDate = parseISO(order.created_at);
      let dateKey: string;
      let displayName: string;

      if (isToday(orderDate)) {
        dateKey = 'today';
        displayName = 'Today';
      } else if (isYesterday(orderDate)) {
        dateKey = 'yesterday';
        displayName = 'Yesterday';
      } else if (isThisWeek(orderDate)) {
        dateKey = format(orderDate, 'yyyy-MM-dd');
        displayName = format(orderDate, 'EEEE, MMM d');
      } else {
        dateKey = format(orderDate, 'yyyy-MM-dd');
        displayName = format(orderDate, 'MMM d, yyyy');
      }

      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(order);
    });

    return Object.entries(groups).map(([date, dayOrders]) => {
      const stats = calculateDayStats(dayOrders);
      const displayName = date === 'today' ? 'Today' : 
                         date === 'yesterday' ? 'Yesterday' : 
                         dayOrders.length > 0 ? format(parseISO(dayOrders[0].created_at), 'EEEE, MMM d') : date;
      
      return { date, displayName, orders: dayOrders, stats };
    }).sort((a, b) => {
      if (a.date === 'today') return -1;
      if (b.date === 'today') return 1;
      if (a.date === 'yesterday') return -1;
      if (b.date === 'yesterday') return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };

  const calculateDayStats = (dayOrders: OrderWithDetails[]): OrderStats => {
    const stats = {
      total: dayOrders.length,
      pending: 0,
      assigned: 0,
      completed: 0,
      cancelled: 0,
      totalRevenue: 0,
    };

    dayOrders.forEach(order => {
      switch (order.status) {
        case 'pending': stats.pending++; break;
        case 'assigned': stats.assigned++; break;
        case 'completed': stats.completed++; break;
        case 'cancelled': stats.cancelled++; break;
      }

      // Add order total to revenue (extract from description)
      const orderInfo = extractOrderInfo(order.description);
      let orderTotal = 0;
      if (orderInfo.total) {
        const cleanAmount = orderInfo.total.replace(/[^\d]/g, '');
        orderTotal = parseInt(cleanAmount) || 0;
      } else if (orderInfo.price) {
        const cleanAmount = orderInfo.price.replace(/[^\d]/g, '');
        orderTotal = parseInt(cleanAmount) || 0;
      }
      stats.totalRevenue += orderTotal;
    });

    return stats;
  };

  const filteredOrders = orders.filter(order => {
    const statusMatch = statusFilter === 'all' || order.status === statusFilter;
    const productMatch = productFilter === 'all' || getProductType(order.description) === productFilter;
    return statusMatch && productMatch;
  });

  const dayGroups = groupOrdersByDay(filteredOrders);
  const overallStats = calculateDayStats(orders);

  const handleAssignOrder = async (orderId: string, deliveryPersonId: string) => {
    setAssigningOrders(prev => new Set(prev).add(orderId));
    try {
      await OrderService.assignOrder(orderId, deliveryPersonId);
      toast({ title: "Success", description: "Order assigned successfully" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to assign order", variant: "destructive" });
    } finally {
      setAssigningOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await OrderService.updateOrderStatus(orderId, status);
      toast({ title: "Success", description: `Order marked as ${status.replace('_', ' ')}` });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update order status", variant: "destructive" });
    }
  };

  const handleCancelOrder = async () => {
    if (!cancellingOrder || !cancellationReason.trim()) return;
    try {
      await OrderService.cancelOrder(cancellingOrder, cancellationReason);
      toast({ title: "Success", description: "Order cancelled successfully" });
      setCancellingOrder(null);
      setCancellationReason('');
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to cancel order", variant: "destructive" });
    }
  };

  const getStatusBadge = (status?: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      assigned: { color: 'bg-blue-100 text-blue-800', label: 'Assigned' },
      in_progress: { color: 'bg-orange-100 text-orange-800', label: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={`${config.color} text-xs`}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading orders...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Statistics */}
      {userRole === 'super_admin' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">UGX {overallStats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{overallStats.total}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Orders</p>
                <p className="text-2xl font-bold">{overallStats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Orders Management</h2>
            <p className="text-sm text-muted-foreground">Total: {orders.length} orders</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="3kg">3kg</SelectItem>
                <SelectItem value="6kg">6kg</SelectItem>
                <SelectItem value="12kg">12kg/13kg</SelectItem>
                <SelectItem value="refill">Refills</SelectItem>
                <SelectItem value="full_kit">Full Kits</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Orders by Day */}
      {dayGroups.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders found</h3>
            <p className="text-muted-foreground">Orders will appear here once customers place them.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {dayGroups.map((dayGroup) => (
            <Card key={dayGroup.date} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{dayGroup.displayName}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{dayGroup.stats.total} orders</Badge>
                    {userRole === 'super_admin' && dayGroup.stats.totalRevenue > 0 && (
                      <Badge className="bg-primary/10 text-primary">
                        UGX {dayGroup.stats.totalRevenue.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                </div>
                {userRole === 'super_admin' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{dayGroup.stats.pending}</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{dayGroup.stats.assigned}</p>
                      <p className="text-xs text-muted-foreground">Assigned</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{dayGroup.stats.completed}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {dayGroup.orders.map((order) => {
                    const orderInfo = extractOrderInfo(order.description);
                    return (
                       <div key={order.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                         <div className="flex items-center justify-between mb-3">
                           <div className="flex items-center gap-2">
                             <span className="font-medium text-sm">
                               {orderInfo.brand} {orderInfo.size} {orderInfo.type}
                             </span>
                             {orderInfo.quantity && (
                               <Badge variant="secondary" className="text-xs">
                                 Qty: {orderInfo.quantity}
                               </Badge>
                             )}
                             {getStatusBadge(order.status)}
                           </div>
                           <div className="text-right">
                             <div className="text-xs text-muted-foreground">
                               {format(new Date(order.created_at), 'h:mm a')}
                             </div>
                           </div>
                         </div>

                         {/* Customer Details */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
                           {orderInfo.contact && (
                             <div className="flex items-center gap-2">
                               <Phone className="w-4 h-4 text-muted-foreground" />
                               <span>{orderInfo.contact}</span>
                             </div>
                           )}
                           {orderInfo.address && (
                             <div className="flex items-start gap-2">
                               <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                               <span className="text-xs">{orderInfo.address}</span>
                             </div>
                           )}
                         </div>

                        <div className="flex items-center justify-between mt-2">
                          {userRole === 'super_admin' && (
                            <div className="flex items-center gap-2">
                              {!order.delivery_man_id && deliveryPersons.length > 0 && order.status === 'pending' ? (
                                <Select onValueChange={(value) => handleAssignOrder(order.id, value)}>
                                  <SelectTrigger className="w-40 h-8 text-xs">
                                    <SelectValue placeholder="Assign to..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {deliveryPersons.map((person) => (
                                      <SelectItem key={person.id} value={person.id}>
                                        {person.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : order.delivery_man ? (
                                <span className="text-xs text-muted-foreground">
                                  Assigned to: <strong>{order.delivery_man.name}</strong>
                                </span>
                              ) : null}
                            </div>
                          )}
                          
                          <div className="flex gap-1">
                            {userRole === 'delivery_man' && order.status === 'assigned' && (
                              <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'in_progress')} className="h-7 text-xs">
                                Start
                              </Button>
                            )}
                            {userRole === 'delivery_man' && order.status === 'in_progress' && (
                              <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'completed')} className="h-7 text-xs">
                                Complete
                              </Button>
                            )}
                            {userRole === 'super_admin' && order.status === 'pending' && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={() => setCancellingOrder(order.id)}>
                                    Cancel
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Cancel Order</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <p>Are you sure you want to cancel this order?</p>
                                    <Textarea 
                                      placeholder="Reason for cancellation..."
                                      value={cancellationReason}
                                      onChange={(e) => setCancellationReason(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                      <Button variant="destructive" onClick={handleCancelOrder}>
                                        Cancel Order
                                      </Button>
                                      <Button variant="outline" onClick={() => setCancellingOrder(null)}>
                                        Close
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};