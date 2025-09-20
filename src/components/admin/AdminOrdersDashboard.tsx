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
    const lines = description.split('\n');
    const info: any = {};
    
    lines.forEach(line => {
      if (line.includes('Brand:') && !line.includes('*Brand:*')) info.brand = line.split('Brand:')[1]?.trim();
      if (line.includes('Size:') && !line.includes('*Size:*')) info.size = line.split('Size:')[1]?.trim();
      if (line.includes('Price:') && !line.includes('*Price:*')) info.price = line.split('Price:')[1]?.trim();
      if (line.includes('Quantity:') && !line.includes('*Quantity:*')) info.quantity = line.split('Quantity:')[1]?.trim();
      if (line.includes('Contact:') && !line.includes('*Contact:*')) info.contact = line.split('Contact:')[1]?.trim();
      if (line.includes('Address:') && !line.includes('*Address:*')) info.address = line.split('Address:')[1]?.trim();
      if (line.includes('Order Type:') && !line.includes('*Order Type:*')) info.type = line.split('Order Type:')[1]?.trim();
      if (line.includes('Item:') && !line.includes('*Item:*')) info.item = line.split('Item:')[1]?.trim();
      if (line.includes('Total Amount:') && !line.includes('*Total Amount:*')) info.total = line.split('Total Amount:')[1]?.trim();
      
      // Also check for WhatsApp format
      if (line.includes('*Brand:*')) info.brand = line.split('*Brand:*')[1]?.trim();
      if (line.includes('*Size:*')) info.size = line.split('*Size:*')[1]?.trim();
      if (line.includes('*Price:*')) info.price = line.split('*Price:*')[1]?.trim();
      if (line.includes('*Quantity:*')) info.quantity = line.split('*Quantity:*')[1]?.trim();
      if (line.includes('*Contact:*')) info.contact = line.split('*Contact:*')[1]?.trim();
      if (line.includes('*Address:*')) info.address = line.split('*Address:*')[1]?.trim();
      if (line.includes('*Order Type:*')) info.type = line.split('*Order Type:*')[1]?.trim();
      if (line.includes('*Item:*')) info.item = line.split('*Item:*')[1]?.trim();
      if (line.includes('*Total Amount:*')) info.total = line.split('*Total Amount:*')[1]?.trim();
    });
    
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
    <div className="space-y-3 px-2 sm:px-0">
      {/* Overall Statistics - More compact on mobile */}
      {userRole === 'super_admin' && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <Card className="p-2 sm:p-4">
            <div className="text-center">
              <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="text-sm sm:text-lg font-bold">
                {overallStats.totalRevenue > 1000000 
                  ? `${(overallStats.totalRevenue / 1000000).toFixed(1)}M`
                  : `${(overallStats.totalRevenue / 1000).toFixed(0)}K`}
              </p>
            </div>
          </Card>
          <Card className="p-2 sm:p-4">
            <div className="text-center">
              <ShoppingCart className="h-4 w-4 sm:h-6 sm:w-6 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Orders</p>
              <p className="text-sm sm:text-lg font-bold">{overallStats.total}</p>
            </div>
          </Card>
          <Card className="p-2 sm:p-4">
            <div className="text-center">
              <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Complete</p>
              <p className="text-sm sm:text-lg font-bold">{overallStats.completed}</p>
            </div>
          </Card>
        </div>
      )}

      {/* Filters - Compact mobile layout */}
      <Card className="p-3 sm:p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">Orders</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">{orders.length} total</p>
            </div>
            <Badge variant="outline" className="text-xs">
              {filteredOrders.length} shown
            </Badge>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1 h-8 text-xs">
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
              <SelectTrigger className="flex-1 h-8 text-xs">
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
        <Card className="p-6 sm:p-8">
          <div className="text-center">
            <Package className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-2 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">No orders found</h3>
            <p className="text-sm text-muted-foreground">Orders will appear here once customers place them.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {dayGroups.map((dayGroup) => (
            <Card key={dayGroup.date} className="overflow-hidden">
              <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg">{dayGroup.displayName}</CardTitle>
                  <div className="flex gap-1 sm:gap-2">
                    <Badge variant="outline" className="text-xs">{dayGroup.stats.total}</Badge>
                    {userRole === 'super_admin' && dayGroup.stats.totalRevenue > 0 && (
                      <Badge className="bg-primary/10 text-primary text-xs hidden sm:inline-flex">
                        UGX {dayGroup.stats.totalRevenue.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                </div>
                {userRole === 'super_admin' && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="text-center">
                      <p className="text-lg sm:text-xl font-bold text-yellow-600">{dayGroup.stats.pending}</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg sm:text-xl font-bold text-blue-600">{dayGroup.stats.assigned}</p>
                      <p className="text-xs text-muted-foreground">Assigned</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg sm:text-xl font-bold text-green-600">{dayGroup.stats.completed}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="space-y-2 sm:space-y-3">
                  {dayGroup.orders.map((order) => {
                    const orderInfo = extractOrderInfo(order.description);
                    return (
                       <div key={order.id} className="p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          {/* Header - Product info and status */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm truncate">
                                  {orderInfo.brand} {orderInfo.size} {orderInfo.type}
                                </span>
                                {orderInfo.quantity && (
                                  <Badge variant="secondary" className="text-xs shrink-0">
                                    {orderInfo.quantity}x
                                  </Badge>
                                )}
                              </div>
                              {getStatusBadge(order.status)}
                            </div>
                            <div className="text-xs text-muted-foreground ml-2">
                              {format(new Date(order.created_at), 'HH:mm')}
                            </div>
                          </div>

                          {/* Customer Details - Compact mobile layout */}
                          <div className="space-y-1 mb-3 text-sm">
                            {orderInfo.contact && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                                <span className="truncate">{orderInfo.contact}</span>
                              </div>
                            )}
                            {orderInfo.address && (
                              <div className="flex items-start gap-2">
                                <MapPin className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                                <span className="text-xs text-muted-foreground line-clamp-2">{orderInfo.address}</span>
                              </div>
                            )}
                          </div>

                         {/* Actions - Mobile-optimized */}
                         <div className="flex items-center justify-between gap-2">
                           {userRole === 'super_admin' && (
                             <div className="flex items-center gap-1 flex-1">
                               {!order.delivery_man_id && deliveryPersons.length > 0 && order.status === 'pending' ? (
                                 <Select onValueChange={(value) => handleAssignOrder(order.id, value)}>
                                   <SelectTrigger className="h-7 text-xs flex-1 min-w-0">
                                     <SelectValue placeholder="Assign..." />
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
                                 <span className="text-xs text-muted-foreground truncate">
                                   <User className="w-3 h-3 inline mr-1" />
                                   {order.delivery_man.name}
                                 </span>
                               ) : null}
                             </div>
                           )}
                           
                           <div className="flex gap-1 shrink-0">
                             {userRole === 'delivery_man' && order.status === 'assigned' && (
                               <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'in_progress')} className="h-7 text-xs px-2">
                                 Start
                               </Button>
                             )}
                             {userRole === 'delivery_man' && order.status === 'in_progress' && (
                               <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'completed')} className="h-7 text-xs px-2">
                                 Complete
                               </Button>
                             )}
                             {userRole === 'super_admin' && order.status === 'pending' && (
                               <Dialog>
                                 <DialogTrigger asChild>
                                   <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => setCancellingOrder(order.id)}>
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