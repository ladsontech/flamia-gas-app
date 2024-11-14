import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { useState } from "react";

interface Order {
  id: string;
  customer: string;
  phone: string;
  address: string;
  brand: string;
  size: string;
  quantity: number;
  type: "new" | "refill";
  status: "pending" | "assigned" | "delivered";
  deliveryPerson?: string;
  orderDate: string;
}

const Admin = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "1",
      customer: "John Doe",
      phone: "+254 123 456 789",
      address: "123 Main St, Nairobi",
      brand: "Total Gas",
      size: "6kg",
      quantity: 1,
      type: "new",
      status: "pending",
      orderDate: "2024-02-20"
    },
    {
      id: "2",
      customer: "Jane Smith",
      phone: "+254 987 654 321",
      address: "456 Oak Ave, Mombasa",
      brand: "Shell Gas",
      size: "12kg",
      quantity: 2,
      type: "refill",
      status: "assigned",
      deliveryPerson: "Mike Wilson",
      orderDate: "2024-02-19"
    },
  ]);

  const deliveryPersonnel = [
    "Mike Wilson",
    "Sarah Johnson",
    "Tom Brown",
  ];

  const assignDelivery = (orderId: string, deliveryPerson: string) => {
    setOrders(orders.map(order => 
      order.id === orderId
        ? { ...order, status: "assigned", deliveryPerson }
        : order
    ));

    toast({
      title: "Delivery Assigned",
      description: `Order assigned to ${deliveryPerson}`,
    });
  };

  const markAsDelivered = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId
        ? { ...order, status: "delivered" }
        : order
    ));

    toast({
      title: "Order Delivered",
      description: "Order has been marked as delivered",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-white py-12">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-8"
        >
          <div className="text-center">
            <span className="px-4 py-1 bg-accent text-accent-foreground rounded-full text-sm mb-4 inline-block">
              Admin Dashboard
            </span>
            <h1 className="text-3xl font-bold">Order Management</h1>
          </div>

          <Card className="glass-card p-6">
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
                    <TableCell>{order.orderDate}</TableCell>
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
                            Assigned to {order.deliveryPerson}
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
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;