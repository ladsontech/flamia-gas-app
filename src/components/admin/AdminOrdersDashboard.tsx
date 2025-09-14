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
  flamiaCommission: number;
  shopEarnings: number;
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

  // Flamia wholesale prices
  const FLAMIA_WHOLESALE_PRICES = {
    '3kg': 20000,
    '6kg': 35000,
    '12kg': 70000,
    '13kg': 70000,
  };

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
      if (line.includes('Size:') || line.includes('*Size:*')) {
        const size = line.split(/Size:|[*]Size:[*]/)[1]?.trim();
        info.size = size;
      }
      if (line.includes('Price:') || line.includes('*Price:*')) {
        const price = line.split(/Price:|[*]Price:[*]/)[1]?.trim();
        info.price = price;
      }
      if (line.includes('Total Amount:') || line.includes('*Total Amount:*')) {
        const total = line.split(/Total Amount:|[*]Total Amount:[*]/)[1]?.trim();
        info.total = total;
      }
      if (line.includes('Order Type:') || line.includes('*Order Type:*')) {
        const type = line.split(/Order Type:|[*]Order Type:[*]/)[1]?.trim();
        info.type = type;
      }
      if (line.includes('Brand:') || line.includes('*Brand:*')) {
        const brand = line.split(/Brand:|[*]Brand:[*]/)[1]?.trim();
        info.brand = brand;
      }
    });
    return info;
  };

  const calculateFlamiaCommission = (order: OrderWithDetails) => {
    const orderInfo = extractOrderInfo(order.description);
    const size = orderInfo.size?.toLowerCase() || '';
    
    // Get selling price from order (prioritize direct price field, fallback to total)
    let sellingPrice = 0;
    if (orderInfo.price) {
      const cleanAmount = orderInfo.price.replace(/[^\d]/g, '');
      sellingPrice = parseInt(cleanAmount) || 0;
    } else if (orderInfo.total) {
      const cleanAmount = orderInfo.total.replace(/[^\d]/g, '');
      sellingPrice = parseInt(cleanAmount) || 0;
    }

    // Determine wholesale price based on cylinder size
    let wholesalePrice = 0;
    if (size.includes('3kg') || size.includes('3 kg')) {
      wholesalePrice = FLAMIA_WHOLESALE_PRICES['3kg'];
    } else if (size.includes('6kg') || size.includes('6 kg')) {
      wholesalePrice = FLAMIA_WHOLESALE_PRICES['6kg'];
    } else if (size.includes('12kg') || size.includes('12 kg')) {
      wholesalePrice = FLAMIA_WHOLESALE_PRICES['12kg'];
    } else if (size.includes('13kg') || size.includes('13 kg')) {
      wholesalePrice = FLAMIA_WHOLESALE_PRICES['13kg'];
    }

    // Flamia's commission is the markup above wholesale
    const flamiaCommission = Math.max(0, sellingPrice - wholesalePrice);
    // Shop gets the wholesale amount 
    const shopEarnings = Math.min(sellingPrice, wholesalePrice);

    return { 
      flamiaCommission, 
      shopEarnings, 
      totalAmount: sellingPrice, 
      wholesalePrice,
      sellingPrice
    };
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
      flamiaCommission: 0,
      shopEarnings: 0,
    };

    dayOrders.forEach(order => {
      switch (order.status) {
        case 'pending': stats.pending++; break;
        case 'assigned': stats.assigned++; break;
        case 'completed': stats.completed++; break;
        case 'cancelled': stats.cancelled++; break;
      }

      if (order.status === 'completed') {
        const commission = calculateFlamiaCommission(order);
        stats.totalRevenue += commission.totalAmount;
        stats.flamiaCommission += commission.flamiaCommission;
        stats.shopEarnings += commission.shopEarnings;
      }
    });

    return stats;
  };

  const filteredOrders = orders.filter(order => {
    const statusMatch = statusFilter === 'all' || order.status === statusFilter;
    const productMatch = productFilter === 'all' || getProductType(order.description) === productFilter;
    return statusMatch && productMatch;
  });

  const dayGroups = groupOrdersByDay(filteredOrders);
  const overallStats = calculateDayStats(orders.filter(o => o.status === 'completed'));

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <p className="text-sm text-muted-foreground">Flamia Commission</p>
                <p className="text-2xl font-bold text-primary">UGX {overallStats.flamiaCommission.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Shop Earnings</p>
                <p className="text-2xl font-bold text-green-600">UGX {overallStats.shopEarnings.toLocaleString()}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-600" />
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
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
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
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">UGX {dayGroup.stats.flamiaCommission.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Flamia Comm.</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">UGX {dayGroup.stats.shopEarnings.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Shop Earnings</p>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {dayGroup.orders.map((order) => {
                    const orderInfo = extractOrderInfo(order.description);
                    const commission = calculateFlamiaCommission(order);
                    return (
                      <div key={order.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {orderInfo.brand || 'Gas'} - {orderInfo.size || 'Unknown'}
                            </span>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {orderInfo.total || 'Price not set'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(order.created_at), 'h:mm a')}
                            </div>
                          </div>
                        </div>
                        
                        {userRole === 'super_admin' && order.status === 'completed' && (
                          <div className="grid grid-cols-3 gap-2 text-xs bg-muted/30 p-2 rounded">
                            <div>
                              <span className="text-muted-foreground">Total:</span>
                              <span className="font-medium ml-1">UGX {commission.totalAmount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Flamia:</span>
                              <span className="font-medium ml-1 text-primary">
                                UGX {commission.sellingPrice.toLocaleString()} - {commission.wholesalePrice.toLocaleString()} = {commission.flamiaCommission.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Shop:</span>
                              <span className="font-medium ml-1 text-green-600">UGX {commission.shopEarnings.toLocaleString()}</span>
                            </div>
                          </div>
                        )}

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