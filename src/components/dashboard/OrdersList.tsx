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
      <Card className="p-4">
        <p className="text-muted-foreground mb-3 text-sm">No orders yet</p>
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
    <div className="space-y-2">
      {sortedDates.map((date) => (
        <div key={date} className="space-y-2">
          <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
            <h2 className="text-xs font-medium text-muted-foreground py-1">
              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </h2>
          </div>
          <div className="space-y-2">
            {groupedOrders[date].map((order) => (
              <Card key={order.id} className="p-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{order.customer_name || order.customer}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <div>{format(new Date(order.created_at!), 'HH:mm')}</div>
                      <div className="truncate">{order.address}</div>
                      <div>{order.phone}</div>
                    </div>
                    
                    <div className="mt-1 text-xs">
                      <span className="font-medium">{order.size} x {order.quantity}</span>
                      <span className="text-muted-foreground ml-2">{order.type}</span>
                      <span className="block font-medium">{order.brand}</span>
                    </div>
                  </div>
                </div>

                {isAdmin && order.status === "pending" && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {deliveryPersonnel.map((person) => (
                      <Button
                        key={person}
                        variant="outline"
                        size="sm"
                        onClick={() => onAssignDelivery(order.id, person)}
                        className="text-xs py-0.5 h-6"
                      >
                        {person}
                      </Button>
                    ))}
                  </div>
                )}
                
                {isAdmin && order.status === "assigned" && (
                  <div className="mt-2 space-y-1">
                    <div className="text-xs text-muted-foreground">
                      Assigned to {order.delivery_person}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onMarkDelivered(order.id)}
                      className="w-full bg-green-500 text-white hover:bg-green-600 h-7 text-xs"
                    >
                      Mark Delivered
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};