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
  // Group orders by date and sort within each group by time
  const groupedOrders = orders.reduce((groups: GroupedOrders, order) => {
    const date = format(new Date(order.order_date), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(order);
    return groups;
  }, {});

  // Sort orders within each date group by time (ascending)
  Object.keys(groupedOrders).forEach(date => {
    groupedOrders[date].sort((a, b) => 
      new Date(a.order_date).getTime() - new Date(b.order_date).getTime()
    );
  });

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedOrders).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-8">
      {sortedDates.map((date) => (
        <div key={date} className="space-y-4">
          <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
            <h2 className="text-sm font-medium text-muted-foreground py-2">
              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedOrders[date].map((order, index) => (
                <TableRow key={order.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{format(new Date(order.order_date), 'HH:mm')}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer}</div>
                      <div className="text-sm text-muted-foreground">{order.address}</div>
                    </div>
                  </TableCell>
                  <TableCell>{order.phone}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{order.size} x {order.quantity}</div>
                      <div className="text-sm text-muted-foreground">{order.type}</div>
                      <div className="text-xs font-medium text-primary">{order.brand}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "assigned"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {order.status === "pending" && (
                      <div className="flex gap-2">
                        {deliveryPersonnel.map((person) => (
                          <Button
                            key={person}
                            variant="outline"
                            size="sm"
                            onClick={() => assignDelivery(order.id, person)}
                            className="hover:bg-accent hover:text-accent-foreground"
                          >
                            Assign to {person}
                          </Button>
                        ))}
                      </div>
                    )}
                    {order.status === "assigned" && (
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Assigned to {order.delivery_person}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => markAsDelivered(order.id)}
                          className="bg-green-500 text-white hover:bg-green-600"
                        >
                          Mark Delivered
                        </Button>
                      </div>
                    )}
                    {order.status === "delivered" && (
                      <span className="text-sm text-green-600 font-medium">
                        Completed
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
};