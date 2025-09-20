import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { OrderService, OrderWithDetails, DeliveryPersonProfile } from "@/services/orderService";
import { Clock, Package, Truck, CheckCircle, User, MapPin, Phone, Calendar, XCircle, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface OrderManagementHubProps {
  userRole: 'super_admin' | 'business_owner' | 'delivery_man' | 'user';
  userId: string;
}

export const OrderManagementHub = ({ userRole, userId }: OrderManagementHubProps) => {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPersonProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [assigningOrders, setAssigningOrders] = useState<Set<string>>(new Set());
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    // Set up real-time subscription for orders
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRole, userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const ordersData = await OrderService.fetchOrders(userRole, userId);
      setOrders(ordersData);

      // Fetch delivery persons for super admin
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

  const handleAssignOrder = async (orderId: string, deliveryPersonId: string) => {
    setAssigningOrders(prev => new Set(prev).add(orderId));
    
    try {
      await OrderService.assignOrder(orderId, deliveryPersonId);
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
      toast({
        title: "Success", 
        description: `Order marked as ${status.replace('_', ' ')}`
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

  const handleCancelOrder = async () => {
    if (!cancellingOrder || !cancellationReason.trim()) return;
    
    try {
      await OrderService.cancelOrder(cancellingOrder, cancellationReason);
      toast({
        title: "Success",
        description: "Order cancelled successfully"
      });
      setCancellingOrder(null);
      setCancellationReason('');
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel order",
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
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
      assigned: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Assigned' },
      in_progress: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelled' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge className={`${config.color} border font-medium`}>
        <div className="flex items-center gap-1">
          {getStatusIcon(status || 'pending')}
          {config.label}
        </div>
      </Badge>
    );
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

const filteredOrders = orders.filter(order => {
    switch (filter) {
      case 'pending':
        return order.status === 'pending';
      case 'in_progress':
        return order.status === 'in_progress';
      case 'completed':
        return order.status === 'completed';
      case 'cancelled':
        return order.status === 'cancelled';
      default:
        return true;
    }
  });

  const getTitle = () => {
    switch (userRole) {
      case 'super_admin': return 'All Orders Management';
      case 'business_owner': return 'Business Orders';
      case 'delivery_man': return 'My Deliveries';
      case 'user': return 'My Orders';
      default: return 'Orders';
    }
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
    <div className="space-y-6">
      {/* Header with filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{getTitle()}</h2>
            <p className="text-sm text-muted-foreground">
              Total: {orders.length} orders | Filtered: {filteredOrders.length} orders
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {userRole === 'super_admin' && (
              <Button
                size="sm"
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All ({orders.length})
              </Button>
            )}
            <Button
              size="sm"
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
            >
              Pending ({orders.filter(o => o.status === 'pending').length})
            </Button>
            <Button
              size="sm"
              variant={filter === 'in_progress' ? 'default' : 'outline'}
              onClick={() => setFilter('in_progress')}
            >
              In Progress ({orders.filter(o => o.status === 'in_progress').length})
            </Button>
            <Button
              size="sm"
              variant={filter === 'completed' ? 'default' : 'outline'}
              onClick={() => setFilter('completed')}
            >
              Completed ({orders.filter(o => o.status === 'completed').length})
            </Button>
            {userRole === 'super_admin' && (
              <Button
                size="sm"
                variant={filter === 'cancelled' ? 'default' : 'outline'}
                onClick={() => setFilter('cancelled')}
              >
                Cancelled ({orders.filter(o => o.status === 'cancelled').length})
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders found</h3>
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? 'Orders will appear here once customers place them.'
                : `No ${filter} orders found.`
              }
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const orderInfo = extractOrderInfo(order.description);
            return (
              <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">
                        {orderInfo.item ? `${orderInfo.item}` : `${orderInfo.brand || 'Gas'} Order`}
                      </CardTitle>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), 'MMM d, h:mm a')}
                      </div>
                      {orderInfo.total && (
                        <div className="font-semibold text-primary">
                          {orderInfo.total}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {order.delivery_man && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 p-2 bg-blue-50 rounded">
                      <User className="h-4 w-4" />
                      <span>Assigned to: <strong>{order.delivery_man.name}</strong></span>
                      {order.assigned_at && (
                        <span className="text-xs ml-2">
                          on {format(new Date(order.assigned_at), 'MMM d, h:mm a')}
                        </span>
                      )}
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {(orderInfo.brand || orderInfo.size || orderInfo.quantity) && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground">ORDER DETAILS</h4>
                        <div className="space-y-1 text-sm">
                          {orderInfo.type && <div><span className="font-medium">Type:</span> {orderInfo.type}</div>}
                          {orderInfo.brand && <div><span className="font-medium">Brand:</span> {orderInfo.brand}</div>}
                          {orderInfo.size && <div><span className="font-medium">Size:</span> {orderInfo.size}</div>}
                          {orderInfo.quantity && <div><span className="font-medium">Quantity:</span> {orderInfo.quantity}</div>}
                          {orderInfo.price && <div><span className="font-medium">Price:</span> {orderInfo.price}</div>}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">CUSTOMER INFO</h4>
                      <div className="space-y-1 text-sm">
                        {orderInfo.contact && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            <span>{orderInfo.contact}</span>
                          </div>
                        )}
                        {orderInfo.address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span className="break-words">{orderInfo.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 flex items-center justify-between">
                    {/* Assignment Section for Super Admin */}
                    {userRole === 'super_admin' && (
                      <div className="flex items-center gap-3">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        {!order.delivery_man_id && deliveryPersons.length > 0 ? (
                          <Select 
                            onValueChange={(value) => handleAssignOrder(order.id, value)}
                            disabled={assigningOrders.has(order.id)}
                          >
                            <SelectTrigger className="w-56">
                              <SelectValue placeholder="Assign to delivery person" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border border-border shadow-lg z-[100] max-h-48 overflow-y-auto">
                              {deliveryPersons.map((deliveryPerson) => (
                                <SelectItem 
                                  key={deliveryPerson.id} 
                                  value={deliveryPerson.id}
                                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                >
                                  {deliveryPerson.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : !order.delivery_man_id ? (
                          <span className="text-sm text-muted-foreground">No delivery persons available</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Assigned to: <strong>{order.delivery_man?.name}</strong>
                          </span>
                        )}
                        {assigningOrders.has(order.id) && (
                          <span className="text-sm text-muted-foreground">Assigning...</span>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      {userRole === 'delivery_man' && (
                        <>
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
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Mark Complete
                            </Button>
                          )}
                          {(order.status === 'assigned' || order.status === 'in_progress') && 
                           order.delivery_latitude && order.delivery_longitude && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                const destination = `${order.delivery_latitude},${order.delivery_longitude}`;
                                const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
                                window.open(url, '_blank');
                              }}
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Navigate
                            </Button>
                          )}
                        </>
                      )}
                      
                      {userRole === 'super_admin' && order.status !== 'completed' && order.status !== 'cancelled' && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateStatus(order.id, 'completed')}
                          >
                            Mark Complete
                          </Button>
                          {order.status === 'pending' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => {
                                    setCancellingOrder(order.id);
                                    setCancellationReason('');
                                  }}
                                >
                                  Cancel Order
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Cancel Order</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <p className="text-sm text-muted-foreground">
                                    Please provide a reason for cancelling this order. Both the customer and referrer (if any) will be notified.
                                  </p>
                                  <Textarea
                                    placeholder="Enter cancellation reason..."
                                    value={cancellationReason}
                                    onChange={(e) => setCancellationReason(e.target.value)}
                                    rows={3}
                                  />
                                  <div className="flex justify-end gap-2">
                                    <Button 
                                      variant="outline" 
                                      onClick={() => {
                                        setCancellingOrder(null);
                                        setCancellationReason('');
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      onClick={handleCancelOrder}
                                      disabled={!cancellationReason.trim()}
                                    >
                                      Confirm Cancellation
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};