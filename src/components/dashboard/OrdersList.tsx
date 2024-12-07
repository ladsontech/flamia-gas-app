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

  // Group orders by date
  const groupedOrders = orders.reduce((groups: { [key: string]: Order[] }, order) => {
    const date = format(new Date(order.created_at!), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(order);
    return groups;
  }, {});

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedOrders).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-3">
      {sortedDates.map((date) => (
        <div key={date} className="space-y-2">
          <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
            <h2 className="text-sm font-medium text-muted-foreground py-2">
              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </h2>
          </div>
          <div className="space-y-2">
            {groupedOrders[date].map((order, index) => (
              <Card key={order.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-1">
                    <span className="text-xs font-medium">Order #{index + 1}</span>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(order.created_at!), 'HH:mm')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="mt-2 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-1">
                    <span className="text-muted-foreground">Size:</span>
                    <span>{order.size}</span>
                    <span className="text-muted-foreground">Quantity:</span>
                    <span>{order.quantity}</span>
                    <span className="text-muted-foreground">Type:</span>
                    <span>{order.type}</span>
                    <span className="text-muted-foreground">Brand:</span>
                    <span>{order.brand}</span>
                  </div>
                  
                  <div className="border-t pt-2">
                    <p className="text-muted-foreground mb-1">Customer Details</p>
                    <p className="font-medium">{order.customer}</p>
                    <p>{order.address}</p>
                    <p>{order.phone}</p>
                  </div>

                  {isAdmin && (
                    <div className="border-t pt-2">
                      {order.status === "pending" && (
                        <div className="space-y-2">
                          <p className="text-muted-foreground">Assign Delivery</p>
                          <div className="flex flex-wrap gap-2">
                            {deliveryPersonnel.map((person) => (
                              <Button
                                key={person}
                                variant="outline"
                                size="sm"
                                onClick={() => onAssignDelivery(order.id, person)}
                                className="text-xs py-1 h-auto"
                              >
                                {person}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {order.status === "assigned" && (
                        <div className="space-y-2">
                          <p className="text-muted-foreground">
                            Assigned to: {order.delivery_person}
                          </p>
                          <Button
                            size="sm"
                            onClick={() => onMarkDelivered(order.id)}
                            className="w-full bg-green-500 text-white hover:bg-green-600"
                          >
                            Mark as Delivered
                          </Button>
                        </div>
                      )}
                      
                      {order.status === "delivered" && (
                        <p className="text-green-600 font-medium">
                          Delivered by {order.delivery_person}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};