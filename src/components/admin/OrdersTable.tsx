import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Order } from "@/types/order";
import { format } from "date-fns";

interface OrdersTableProps {
  orders: Order[];
  deliveryPersonnel: string[];
  assignDelivery: (orderId: string, deliveryPerson: string) => void;
  markAsDelivered: (orderId: string) => void;
}

interface GroupedOrders {
  [date: string]: Order[];
}

export const OrdersTable = ({ 
  orders, 
  deliveryPersonnel, 
  assignDelivery, 
  markAsDelivered 
}: OrdersTableProps) => {
  const groupedOrders = orders.reduce((groups: GroupedOrders, order) => {
    const date = format(new Date(order.order_date), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(order);
    return groups;
  }, {});

  Object.keys(groupedOrders).forEach(date => {
    groupedOrders[date].sort((a, b) => 
      new Date(a.order_date).getTime() - new Date(b.order_date).getTime()
    );
  });

  const sortedDates = Object.keys(groupedOrders).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-2">
      {sortedDates.map((date) => (
        <div key={date} className="space-y-1">
          <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
            <h2 className="text-xs font-medium text-muted-foreground py-1">
              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </h2>
          </div>
          <div className="grid gap-2">
            {groupedOrders[date].map((order, index) => (
              <div key={order.id} className="bg-white p-3 rounded-lg shadow-sm border">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-medium">#{index + 1}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      order.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "assigned"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                
                <div className="space-y-1 text-xs mt-1">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{format(new Date(order.order_date), 'HH:mm')}</span>
                  </div>
                  
                  <div>
                    <div className="font-medium">{order.customer}</div>
                    <div className="text-muted-foreground">{order.address}</div>
                    <div>{order.phone}</div>
                  </div>
                  
                  <div className="border-t pt-1">
                    <div className="font-medium">{order.size} x {order.quantity}</div>
                    <div className="text-muted-foreground">{order.type}</div>
                    <div className="font-medium">{order.brand}</div>
                  </div>

                  {order.status === "assigned" && (
                    <div className="space-y-1 pt-1">
                      <div className="text-muted-foreground">
                        Assigned to {order.delivery_person}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => markAsDelivered(order.id)}
                        className="w-full bg-green-500 text-white hover:bg-green-600 h-7"
                      >
                        Mark Delivered
                      </Button>
                    </div>
                  )}
                  
                  {order.status === "delivered" && (
                    <div className="text-green-600 font-medium pt-1">
                      Completed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};