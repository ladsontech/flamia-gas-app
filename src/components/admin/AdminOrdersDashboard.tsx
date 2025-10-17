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
  DollarSign, TrendingUp, ShoppingCart, Filter, BarChart3, ChevronDown, Navigation
} from "lucide-react";
import { format, isToday, isYesterday, startOfWeek, isThisWeek, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface AdminOrdersDashboardProps {
  userRole: 'super_admin' | 'business_owner' | 'delivery_man' | 'user';
  userId: string;
  orderType?: 'all' | 'gas' | 'shop';
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

export const AdminOrdersDashboard = ({ userRole, userId, orderType = 'all' }: AdminOrdersDashboardProps) => {
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

  const isGasOrder = (description: string) => {
    const desc = description.toLowerCase();
    return desc.includes('kg') || desc.includes('gas') || desc.includes('refill') || desc.includes('cylinder');
  };

  const isShopOrder = (description: string) => {
    return !isGasOrder(description);
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
    
    // Apply order type filter
    let typeMatch = true;
    if (orderType === 'gas') {
      typeMatch = isGasOrder(order.description);
    } else if (orderType === 'shop') {
      typeMatch = isShopOrder(order.description);
    }
    
    return statusMatch && productMatch && typeMatch;
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
      pending: { color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20', label: 'Pending' },
      assigned: { color: 'bg-blue-500/10 text-blue-700 border-blue-500/20', label: 'Assigned' },
      in_progress: { color: 'bg-orange-500/10 text-orange-700 border-orange-500/20', label: 'In Progress' },
      completed: { color: 'bg-green-500/10 text-green-700 border-green-500/20', label: 'Completed' },
      cancelled: { color: 'bg-red-500/10 text-red-700 border-red-500/20', label: 'Cancelled' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={`${config.color} text-xs font-medium border`}>{config.label}</Badge>;
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
    <div className="space-y-4 px-0">
      {/* Overall Statistics - Mobile optimized */}
      {userRole === 'super_admin' && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 bg-gradient-to-br from-card to-muted/20 border-border/50">
            <div className="text-center">
              <DollarSign className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Revenue</p>
              <p className="text-sm sm:text-base font-bold">
                {overallStats.totalRevenue > 1000000 
                  ? `${(overallStats.totalRevenue / 1000000).toFixed(1)}M`
                  : `${(overallStats.totalRevenue / 1000).toFixed(0)}K`}
              </p>
            </div>
          </Card>
          <Card className="p-3 bg-gradient-to-br from-card to-muted/20 border-border/50">
            <div className="text-center">
              <ShoppingCart className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Orders</p>
              <p className="text-sm sm:text-base font-bold">{overallStats.total}</p>
            </div>
          </Card>
          <Card className="p-3 bg-gradient-to-br from-card to-muted/20 border-border/50">
            <div className="text-center">
              <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Done</p>
              <p className="text-sm sm:text-base font-bold">{overallStats.completed}</p>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4 border-border/50">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Orders</h2>
              <p className="text-xs text-muted-foreground">{orders.length} total orders</p>
            </div>
            <Badge variant="outline" className="text-xs font-semibold">
              {filteredOrders.length}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1 h-9 text-xs">
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
            {orderType !== 'shop' && (
              <Select value={productFilter} onValueChange={setProductFilter}>
                <SelectTrigger className="flex-1 h-9 text-xs">
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
            )}
          </div>
        </div>
      </Card>

      {/* Orders by Day */}
      {dayGroups.length === 0 ? (
        <Card className="p-8 border-border/50">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No orders found</h3>
            <p className="text-sm text-muted-foreground">Orders will appear here once customers place them.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {dayGroups.map((dayGroup) => (
            <Card key={dayGroup.date} className="overflow-hidden border-border/50">
              <CardHeader className="p-4 pb-3 bg-muted/20">
                <div className="flex items-center justify-between mb-3">
                  <CardTitle className="text-base sm:text-lg font-bold">{dayGroup.displayName}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs font-semibold">{dayGroup.stats.total}</Badge>
                    {userRole === 'super_admin' && dayGroup.stats.totalRevenue > 0 && (
                      <Badge className="bg-primary/10 text-primary text-xs font-semibold border-primary/20 border hidden sm:inline-flex">
                        UGX {dayGroup.stats.totalRevenue.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                </div>
                {userRole === 'super_admin' && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center bg-card rounded-lg p-2 border border-border/50">
                      <p className="text-xl sm:text-2xl font-bold text-yellow-600">{dayGroup.stats.pending}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pending</p>
                    </div>
                    <div className="text-center bg-card rounded-lg p-2 border border-border/50">
                      <p className="text-xl sm:text-2xl font-bold text-blue-600">{dayGroup.stats.assigned}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Assigned</p>
                    </div>
                    <div className="text-center bg-card rounded-lg p-2 border border-border/50">
                      <p className="text-xl sm:text-2xl font-bold text-green-600">{dayGroup.stats.completed}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Completed</p>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-3 space-y-3">
                {dayGroup.orders.map((order) => {
                  const orderInfo = extractOrderInfo(order.description);
                  return (
                    <CompactOrderCard
                      key={order.id}
                      order={order}
                      orderInfo={orderInfo}
                      userRole={userRole}
                      deliveryPersons={deliveryPersons}
                      onAssignOrder={handleAssignOrder}
                      onUpdateStatus={handleUpdateStatus}
                      onCancelOrder={() => setCancellingOrder(order.id)}
                      assigningOrders={assigningOrders}
                      getStatusBadge={getStatusBadge}
                    />
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Cancel Order Dialog */}
      <Dialog open={!!cancellingOrder} onOpenChange={() => setCancellingOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Reason for cancellation..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleCancelOrder}
                disabled={!cancellationReason.trim()}
              >
                Cancel Order
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCancellingOrder(null);
                  setCancellationReason('');
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Compact Order Card Component
interface CompactOrderCardProps {
  order: OrderWithDetails;
  orderInfo: any;
  userRole: string;
  deliveryPersons: DeliveryPersonProfile[];
  onAssignOrder: (orderId: string, deliveryPersonId: string) => void;
  onUpdateStatus: (orderId: string, status: string) => void;
  onCancelOrder: () => void;
  assigningOrders: Set<string>;
  getStatusBadge: (status?: string) => React.ReactNode;
}

const CompactOrderCard = ({ 
  order, 
  orderInfo, 
  userRole, 
  deliveryPersons, 
  onAssignOrder, 
  onUpdateStatus, 
  onCancelOrder,
  assigningOrders,
  getStatusBadge 
}: CompactOrderCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate order total
  const getOrderTotal = () => {
    if (order.total_amount) return order.total_amount;
    if (orderInfo.total) {
      const cleanAmount = orderInfo.total.replace(/[^\d]/g, '');
      return parseInt(cleanAmount) || 0;
    }
    if (orderInfo.price) {
      const cleanAmount = orderInfo.price.replace(/[^\d]/g, '');
      return parseInt(cleanAmount) || 0;
    }
    return 0;
  };

  const orderTotal = getOrderTotal();

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      {/* Compact List View */}
      <div 
        className="flex items-center gap-3 p-4 cursor-pointer active:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
          <Package className="h-6 w-6 text-primary" />
        </div>

        {/* Order Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm truncate">
              {orderInfo.brand && orderInfo.size 
                ? `${orderInfo.brand} • ${orderInfo.size}`
                : orderInfo.item || 'Order'
              }
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-0.5">
            {format(new Date(order.created_at), 'dd/MM/yyyy, h:mm a')}
          </p>
          <div className="flex items-center gap-2">
            {getStatusBadge(order.status)}
          </div>
        </div>

        {/* Amount & Arrow */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="font-bold text-base">
              {orderTotal > 0 ? orderTotal.toLocaleString() : '-'}
            </p>
            <p className="text-xs text-muted-foreground">UGX</p>
          </div>
          <ChevronDown 
            className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </div>

      {/* Expanded Details View */}
      {isExpanded && (
        <div className="border-t border-border/50 bg-muted/30">
          <div className="p-4 space-y-4">
            {/* Order Summary */}
            <div className="bg-card rounded-lg p-3 border border-border/50">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Order Details
              </h4>
              <div className="space-y-2 text-sm">
                {orderInfo.brand && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Brand</span>
                    <span className="font-medium">{orderInfo.brand}</span>
                  </div>
                )}
                {orderInfo.size && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size</span>
                    <span className="font-medium">{orderInfo.size}</span>
                  </div>
                )}
                {orderInfo.type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">{orderInfo.type}</span>
                  </div>
                )}
                {orderInfo.quantity && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-medium">{orderInfo.quantity}</span>
                  </div>
                )}
                {orderInfo.item && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Item</span>
                    <span className="font-medium">{orderInfo.item}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-border/50">
                  <span className="text-muted-foreground font-semibold">Total</span>
                  <span className="font-bold text-primary">
                    UGX {orderTotal > 0 ? orderTotal.toLocaleString() : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-card rounded-lg p-3 border border-border/50">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Customer Details
              </h4>
              <div className="space-y-3 text-sm">
                {orderInfo.contact && (
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Contact</p>
                      <p className="font-medium">{orderInfo.contact}</p>
                    </div>
                  </div>
                )}
                {(orderInfo.address || order.delivery_address) && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">Delivery Address</p>
                      <p className="font-medium leading-relaxed">
                        {orderInfo.address || order.delivery_address}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Location coordinates with navigation */}
                {(order.delivery_latitude && order.delivery_longitude) && (
                  <div className="bg-muted/50 rounded-lg p-2.5 border border-border/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Navigation className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-mono">
                        {order.delivery_latitude.toFixed(6)}, {order.delivery_longitude.toFixed(6)}
                      </span>
                    </div>
                    {(userRole === 'delivery_man' || userRole === 'super_admin') && (
                      <Button
                        size="sm"
                        className="w-full h-8 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${order.delivery_latitude},${order.delivery_longitude}`;
                          window.open(url, '_blank');
                        }}
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        Navigate with Google Maps
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Info */}
            {order.delivery_man && (
              <div className="bg-card rounded-lg p-3 border border-border/50">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Delivery Person
                </h4>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{order.delivery_man.name}</p>
                    {order.assigned_at && (
                      <p className="text-xs text-muted-foreground">
                        Assigned {format(new Date(order.assigned_at), 'MMM d, h:mm a')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Order ID */}
            <div className="bg-card rounded-lg p-3 border border-border/50">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Order ID
              </h4>
              <p className="text-xs font-mono text-muted-foreground">#{order.id.slice(0, 8)}</p>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              {userRole === 'super_admin' && !order.delivery_man_id && deliveryPersons.length > 0 && (
                <Select onValueChange={(value) => onAssignOrder(order.id, value)}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="Assign to delivery person" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryPersons.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className="flex gap-2">
                {userRole === 'delivery_man' && order.status === 'assigned' && (
                  <Button 
                    className="flex-1 h-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStatus(order.id, 'in_progress');
                    }}
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Start Delivery
                  </Button>
                )}
                {userRole === 'delivery_man' && order.status === 'in_progress' && (
                  <Button 
                    className="flex-1 h-10 bg-green-600 hover:bg-green-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStatus(order.id, 'completed');
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Completed
                  </Button>
                )}
                {userRole === 'super_admin' && order.status !== 'completed' && order.status !== 'cancelled' && (
                  <Button 
                    variant="destructive" 
                    className="flex-1 h-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancelOrder();
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};