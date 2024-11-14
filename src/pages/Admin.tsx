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
  address: string;
  brand: string;
  status: "pending" | "assigned" | "delivered";
  deliveryPerson?: string;
}

const Admin = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "1",
      customer: "John Doe",
      address: "123 Main St",
      brand: "Premium Gas",
      status: "pending",
    },
    {
      id: "2",
      customer: "Jane Smith",
      address: "456 Oak Ave",
      brand: "Standard Gas",
      status: "assigned",
      deliveryPerson: "Mike Wilson",
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
                  <TableHead>Customer</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.address}</TableCell>
                    <TableCell>{order.brand}</TableCell>
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
                        <span className="text-sm text-muted-foreground">
                          Assigned to {order.deliveryPerson}
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