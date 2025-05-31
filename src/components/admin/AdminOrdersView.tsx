
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Order, DeliveryMan } from "@/types/order";
import { format } from "date-fns";
import { Calendar, User, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { assignOrderToDeliveryMan } from "@/services/database";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

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

  const getDeliveryManName = (deliveryManId: string) => {
    const deliveryMan = deliveryMen.find(dm => dm.id === deliveryManId);
    return deliveryMan?.name || 'Unknown';
  };

  const getStatusBadge = (status?: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || statusColors.pending}>
        {status || 'pending'}
      </Badge>
    );
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

  const groupedOrders = groupOrdersByDate(orders);
  
  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(groupedOrders).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  if (!orders.length) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No orders found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {sortedDates.map(dateKey => {
        let orderCounter = 1;
        
        return (
          <div key={dateKey} className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">
                {format(groupedOrders[dateKey].dateObj, 'EEEE, MMMM d, yyyy')}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {groupedOrders[dateKey].orders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                          {orderCounter++}
                        </Badge>
                        <span className="font-semibold">Order Details</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(order.created_at), 'h:mm a')}
                      </span>
                    </div>
                    
                    {order.delivery_man_id && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <User className="h-4 w-4" />
                        <span>Assigned to: {getDeliveryManName(order.delivery_man_id)}</span>
                        {order.assigned_at && (
                          <span className="text-xs">
                            on {format(new Date(order.assigned_at), 'MMM d, h:mm a')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="whitespace-pre-wrap text-sm mb-4">
                      {order.description}
                    </div>
                    
                    {!order.delivery_man_id && (
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <Select onValueChange={(value) => handleAssignOrder(order.id, value)}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Assign to delivery person" />
                          </SelectTrigger>
                          <SelectContent>
                            {deliveryMen.map((deliveryMan) => (
                              <SelectItem key={deliveryMan.id} value={deliveryMan.id}>
                                {deliveryMan.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {assigningOrders.has(order.id) && (
                          <span className="text-sm text-muted-foreground">Assigning...</span>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
