import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Order, DeliveryMan } from "@/types/order";
import { format } from "date-fns";
import { Calendar, User, Truck, MapPin, Phone, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { assignOrderToDeliveryMan, updateOrderStatus } from "@/services/database";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AdminOrdersViewProps {
  orders: Order[];
  deliveryMen: DeliveryMan[];
  onOrdersUpdate: () => void;
}

type GroupedOrders = {
  [date: string]: {
    orders: Order[];
    dateObj: Date;
  }
};

export const AdminOrdersView = ({ orders, deliveryMen, onOrdersUpdate }: AdminOrdersViewProps) => {
  const { toast } = useToast();
  const [assigningOrders, setAssigningOrders] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>('all');

  const handleAssignOrder = async (orderId: string, deliveryManId: string) => {
    setAssigningOrders(prev => new Set(prev).add(orderId));
    
    try {
      await assignOrderToDeliveryMan(orderId, deliveryManId);
      toast({
        title: "Order assigned",
        description: "Order has been assigned to delivery person"
      });
      onOrdersUpdate();
    } catch (error) {
      toast({
        title: "Assignment failed",
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

  const handleCompleteOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'completed');
      toast({
        title: "Order completed",
        description: "Order has been marked as completed"
      });
      onOrdersUpdate();
    } catch (error) {
      toast({
        title: "Failed to complete order",
        description: "There was an error completing the order",
        variant: "destructive"
      });
    }
  };

  const getDeliveryManName = (deliveryManId: string) => {
    const deliveryMan = deliveryMen.find(dm => dm.id === deliveryManId);
    return deliveryMan?.name || 'Unknown';
  };

  const getStatusBadge = (status?: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
      assigned: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Assigned' },
      in_progress: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Completed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge className={`${config.color} border font-medium`}>
        {config.label}
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

  // Group orders by date
  const groupOrdersByDate = (orders: Order[]): GroupedOrders => {
    return orders.reduce((acc: GroupedOrders, order) => {
      const orderDate = new Date(order.created_at);
      const dateKey = format(orderDate, 'yyyy-MM-dd');
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          orders: [],
          dateObj: orderDate
        };
      }
      
      acc[dateKey].orders.push(order);
      return acc;
    }, {});
  };

  // Filter orders based on selected filter
  const filteredOrders = orders.filter(order => {
    switch (filter) {
      case 'pending':
        return !order.delivery_man_id && order.status === 'pending';
      case 'assigned':
        return order.delivery_man_id && order.status === 'assigned';
      case 'in_progress':
        return order.status === 'in_progress';
      case 'completed':
        return order.status === 'completed';
      default:
        return true;
    }
  });

  const groupedOrders = groupOrdersByDate(filteredOrders);
  
  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(groupedOrders).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Order Management</h2>
            <p className="text-sm text-muted-foreground">
              Total: {orders.length} orders | Filtered: {filteredOrders.length} orders
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All ({orders.length})
            </Button>
            <Button
              size="sm"
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
            >
              Pending ({orders.filter(o => !o.delivery_man_id && o.status === 'pending').length})
            </Button>
            <Button
              size="sm"
              variant={filter === 'assigned' ? 'default' : 'outline'}
              onClick={() => setFilter('assigned')}
            >
              Assigned ({orders.filter(o => o.delivery_man_id && o.status === 'assigned').length})
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
          </div>
        </div>
      </Card>

      {!filteredOrders.length ? (
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
        <div className="space-y-8">
          {sortedDates.map(dateKey => {
            let orderCounter = 1;
            
            return (
              <div key={dateKey} className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">
                    {format(groupedOrders[dateKey].dateObj, 'EEEE, MMMM d, yyyy')}
                  </h2>
                  <Badge variant="secondary" className="ml-auto">
                    {groupedOrders[dateKey].orders.length} orders
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  {groupedOrders[dateKey].orders.map((order) => {
                    const orderInfo = extractOrderInfo(order.description);
                    return (
                      <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="h-7 w-7 rounded-full p-0 flex items-center justify-center font-bold">
                                {orderCounter++}
                              </Badge>
                              <CardTitle className="text-lg">
                                {orderInfo.item ? `${orderInfo.item}` : `${orderInfo.brand || 'Gas'} Order`}
                              </CardTitle>
                              {getStatusBadge(order.status)}
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(order.created_at), 'h:mm a')}
                              </div>
                              {orderInfo.total && (
                                <div className="font-semibold text-primary">
                                  {orderInfo.total}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {order.delivery_man_id && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 p-2 bg-blue-50 rounded">
                              <User className="h-4 w-4" />
                              <span>Assigned to: <strong>{getDeliveryManName(order.delivery_man_id)}</strong></span>
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
                            <div className="flex items-center gap-3">
                              <Truck className="h-4 w-4 text-muted-foreground" />
                              {!order.delivery_man_id && deliveryMen.length > 0 ? (
                                <Select onValueChange={(value) => handleAssignOrder(order.id, value)}>
                                  <SelectTrigger className="w-56">
                                    <SelectValue placeholder="Assign to delivery person" />
                                  </SelectTrigger>
                                   <SelectContent className="bg-card border border-border shadow-lg z-[100] max-h-48 overflow-y-auto">
                                     {deliveryMen.map((deliveryMan) => (
                                       <SelectItem 
                                         key={deliveryMan.id} 
                                         value={deliveryMan.id}
                                         className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                       >
                                         {deliveryMan.name}
                                       </SelectItem>
                                     ))}
                                  </SelectContent>
                                </Select>
                              ) : !order.delivery_man_id ? (
                                <span className="text-sm text-muted-foreground">No delivery men available</span>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  Assigned to: <strong>{getDeliveryManName(order.delivery_man_id)}</strong>
                                </span>
                              )}
                              {assigningOrders.has(order.id) && (
                                <span className="text-sm text-muted-foreground">Assigning...</span>
                              )}
                            </div>
                            {order.status !== 'completed' && (
                              <Button 
                                size="sm" 
                                onClick={() => handleCompleteOrder(order.id)}
                                className="ml-2"
                              >
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};