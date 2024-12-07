import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Order } from "@/types/order";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OrdersListProps {
  orders: Order[];
  isAdmin: boolean;
  onAssignDelivery: (orderId: string, deliveryPerson: string) => void;
  onMarkDelivered: (orderId: string) => void;
}

export const OrdersList = ({ 
  orders, 
  isAdmin, 
  onAssignDelivery, 
  onMarkDelivered 
}: OrdersListProps) => {
  const navigate = useNavigate();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const deliveryPersonnel = [
    "Fahad",
    "Osingya",
    "Peter",
    "Steven"
  ];

  if (orders.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground mb-4 text-sm">No orders yet</p>
        <Button 
          onClick={() => navigate('/order')}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Place an Order
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Card key={order.id} className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="space-y-1">
              <h3 className="font-medium text-sm">{order.brand}</h3>
              <p className="text-xs text-muted-foreground">
                {format(new Date(order.created_at!), 'MMM d, yyyy HH:mm')}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
          
          <div className="mt-3 space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-1 text-xs">
              <span className="text-muted-foreground">Size:</span>
              <span>{order.size}</span>
              <span className="text-muted-foreground">Quantity:</span>
              <span>{order.quantity}</span>
              <span className="text-muted-foreground">Type:</span>
              <span>{order.type}</span>
              <span className="text-muted-foreground">Customer:</span>
              <span>{order.customer}</span>
            </div>
            
            <div className="border-t pt-2 mt-2">
              <p className="text-xs text-muted-foreground mb-1">Delivery Details</p>
              <p className="text-xs">{order.address}</p>
              <p className="text-xs">{order.phone}</p>
              {order.delivery_person && (
                <p className="text-xs mt-1">Delivery Person: {order.delivery_person}</p>
              )}
            </div>

            {isAdmin && order.status === "pending" && (
              <div className="flex flex-wrap gap-2 pt-2">
                {deliveryPersonnel.map((person) => (
                  <Button
                    key={person}
                    variant="outline"
                    size="sm"
                    onClick={() => onAssignDelivery(order.id, person)}
                    className="text-xs py-1 h-auto"
                  >
                    Assign to {person}
                  </Button>
                ))}
              </div>
            )}

            {isAdmin && order.status === "assigned" && (
              <Button
                size="sm"
                onClick={() => onMarkDelivered(order.id)}
                className="w-full bg-green-500 text-white hover:bg-green-600 mt-2"
              >
                Mark Delivered
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};