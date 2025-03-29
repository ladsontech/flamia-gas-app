
import { Card } from "@/components/ui/card";
import { Order } from "@/types/order";
import { format, isSameDay } from "date-fns";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
        // Reset counter for each date
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
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                        {orderCounter++}
                      </Badge>
                      <span className="font-semibold">
                        Order Details
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {format(new Date(order.created_at), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 whitespace-pre-wrap text-sm">
                    {order.description}
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
