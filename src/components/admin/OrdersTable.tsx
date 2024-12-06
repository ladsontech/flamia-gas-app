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
    <div className="space-y-4">
      {sortedDates.map((date) => (
        <div key={date} className="space-y-2">
          <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
            <h2 className="text-sm font-medium text-muted-foreground py-2">
              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </h2>
          </div>
          <div className="grid gap-4">
            {groupedOrders[date].map((order, index) => (
              <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium">Order #{index + 1}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
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
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span>{format(new Date(order.order_date), 'HH:mm')}</span>
                  </div>
                  
                  <div>
                    <div className="font-medium">{order.customer}</div>
                    <div className="text-muted-foreground text-xs">{order.address}</div>
                    <div className="text-xs">{order.phone}</div>
                  </div>
                  
                  <div className="border-t pt-2">
                    <div className="font-medium">{order.size} x {order.quantity}</div>
                    <div className="text-xs text-muted-foreground">{order.type}</div>
                    <div className="text-xs font-medium">{order.brand}</div>
                  </div>

                  {order.status === "pending" && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {deliveryPersonnel.map((person) => (
                        <Button
                          key={person}
                          variant="outline"
                          size="sm"
                          onClick={() => assignDelivery(order.id, person)}
                          className="text-xs py-1 h-auto"
                        >
                          Assign to {person}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  {order.status === "assigned" && (
                    <div className="space-y-2 pt-2">
                      <div className="text-xs text-muted-foreground">
                        Assigned to {order.delivery_person}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => markAsDelivered(order.id)}
                        className="w-full bg-green-500 text-white hover:bg-green-600"
                      >
                        Mark Delivered
                      </Button>
                    </div>
                  )}
                  
                  {order.status === "delivered" && (
                    <div className="text-xs text-green-600 font-medium pt-2">
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