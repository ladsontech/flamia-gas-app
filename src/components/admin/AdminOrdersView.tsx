
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Order } from "@/types/order";
import { formatDistanceToNow, format, isSameDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ChevronDown, ChevronUp, Check, X, User, Phone, MapPin, Calendar } from "lucide-react";
import { updateOrderStatus } from "@/services/database";
import { useToast } from "@/components/ui/use-toast";

interface AdminOrdersViewProps {
  orders: Order[];
  onOrdersUpdate: () => void;
}

type GroupedOrders = {
  [date: string]: {
    orders: Order[];
    dateObj: Date;
  }
};

export const AdminOrdersView = ({ orders, onOrdersUpdate }: AdminOrdersViewProps) => {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const { toast } = useToast();

  // Group orders by date
  const groupOrdersByDate = (orders: Order[]): GroupedOrders => {
    return orders.reduce((acc: GroupedOrders, order) => {
      const orderDate = new Date(order.created_at || order.order_date);
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

  const groupedOrders = groupOrdersByDate(orders);
  
  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(groupedOrders).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'delivered':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      case 'assigned':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
    }
  };

  const toggleOrderExpanded = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      toast({
        title: "Order updated",
        description: `Order status changed to ${status}`,
      });
      onOrdersUpdate();
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Could not update order status",
        variant: "destructive",
      });
    }
  };

  const handleAssignDelivery = async (orderId: string) => {
    const deliveryPerson = prompt("Enter delivery person name:");
    if (deliveryPerson) {
      try {
        await updateOrderStatus(orderId, "assigned", deliveryPerson);
        toast({
          title: "Order assigned",
          description: `Order assigned to ${deliveryPerson}`,
        });
        onOrdersUpdate();
      } catch (error) {
        toast({
          title: "Assignment failed",
          description: "Could not assign delivery person",
          variant: "destructive",
        });
      }
    }
  };

  if (!orders.length) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No orders found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {sortedDates.map(dateKey => (
        <div key={dateKey} className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">
              {format(groupedOrders[dateKey].dateObj, 'EEEE, MMMM d, yyyy')}
            </h2>
          </div>
          
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedOrders[dateKey].orders.map((order, index) => (
                  <>
                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell onClick={() => toggleOrderExpanded(order.id)}>
                        {expandedOrder === order.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </TableCell>
                      <TableCell>{order.customer_name || order.customer}</TableCell>
                      <TableCell>{order.type}</TableCell>
                      <TableCell>{order.brand}</TableCell>
                      <TableCell>{order.size}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)} variant="outline">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.created_at
                          ? format(new Date(order.created_at), 'h:mm a')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAssignDelivery(order.id)}
                              className="h-7 px-2"
                            >
                              Assign
                            </Button>
                          )}
                          {(order.status === 'pending' || order.status === 'assigned') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(order.id, 'delivered')}
                              className="h-7 px-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-200"
                            >
                              <Check className="h-3.5 w-3.5 mr-1" />
                              Done
                            </Button>
                          )}
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                              className="h-7 px-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-200"
                            >
                              <X className="h-3.5 w-3.5 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedOrder === order.id && (
                      <TableRow>
                        <TableCell colSpan={9}>
                          <div className="px-4 py-3 bg-muted/30 rounded-md space-y-2 my-1">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center text-sm gap-1.5">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Customer:</span> {order.customer_name || order.customer}
                                </div>
                                <div className="flex items-center text-sm gap-1.5">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Contact:</span> {order.phone}
                                </div>
                                <div className="flex items-start text-sm gap-1.5">
                                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                  <div>
                                    <span className="font-medium">Address:</span> {order.address}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="text-sm">
                                  <span className="font-medium">Order Type:</span> {order.type === 'fullset' ? 'Full Set' : 'Refill'}
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium">Brand:</span> {order.brand}
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium">Size:</span> {order.size}
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium">Quantity:</span> {order.quantity}
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="text-sm">
                                  <span className="font-medium">Status:</span> {order.status}
                                </div>
                                {order.delivery_person && (
                                  <div className="text-sm">
                                    <span className="font-medium">Delivery Person:</span> {order.delivery_person}
                                  </div>
                                )}
                                <div className="text-sm">
                                  <span className="font-medium">Order Date:</span> {new Date(order.created_at || '').toLocaleString()}
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium">Free Delivery:</span> Within Kampala
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      ))}
    </div>
  );
};
