
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Order } from "@/types/order";
import { formatDistanceToNow, format, isSameDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { ChevronDown, ChevronUp, User, Phone, MapPin, Calendar } from "lucide-react";

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

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'delivered':
        return 'bg-green-500/10 text-green-500';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500';
      case 'assigned':
        return 'bg-blue-500/10 text-blue-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const toggleOrderExpanded = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedOrders[dateKey].orders.map((order, index) => (
              <Card key={order.id} className="overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="font-semibold">
                      {order.type === 'accessory' ? 'New Accessory Order' : 'New Gas Order'}
                    </span>
                  </div>
                  <div>
                    <Badge variant="outline" className={getStatusBadgeClass(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-4 bg-muted/10 space-y-1 text-sm">
                  {order.type !== 'accessory' && (
                    <>
                      <div className="flex justify-between">
                        <span className="font-medium">Order Type:</span>
                        <span>{order.type === 'fullset' ? 'Full Set' : 'Refill'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Brand:</span>
                        <span>{order.brand}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Size:</span>
                        <span>{order.size}</span>
                      </div>
                    </>
                  )}
                  {order.type === 'accessory' && (
                    <div className="flex justify-between">
                      <span className="font-medium">Item:</span>
                      <span>{order.brand}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">Quantity:</span>
                    <span>{order.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Contact:</span>
                    <span>{order.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Address:</span>
                    <span>{order.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Date/Time:</span>
                    <span>{new Date(order.created_at || order.order_date).toLocaleString()}</span>
                  </div>
                  {order.delivery_person && (
                    <div className="flex justify-between">
                      <span className="font-medium">Delivery Person:</span>
                      <span>{order.delivery_person}</span>
                    </div>
                  )}
                  <div className="pt-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Free Delivery:</span>
                      <span>Within Kampala</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
