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

interface OrdersTableProps {
  orders: Order[];
  deliveryPersonnel: string[];
  assignDelivery: (orderId: string, deliveryPerson: string) => void;
  markAsDelivered: (orderId: string) => void;
}

export const OrdersTable = ({ 
  orders, 
  deliveryPersonnel, 
  assignDelivery, 
  markAsDelivered 
}: OrdersTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Details</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>{order.id}</TableCell>
            <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{order.customer}</div>
                <div className="text-sm text-muted-foreground">{order.address}</div>
              </div>
            </TableCell>
            <TableCell>{order.phone}</TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{order.brand}</div>
                <div className="text-sm text-muted-foreground">
                  {order.size} x {order.quantity} ({order.type})
                </div>
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
  );
};