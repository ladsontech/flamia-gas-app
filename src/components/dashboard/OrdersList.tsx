import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Order } from "@/types/order";
import { PlusCircle, Flame, MapPin, Package2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
        return 'bg-yellow-100/80 text-yellow-800 border border-yellow-200';
      case 'assigned':
        return 'bg-blue-100/80 text-blue-800 border border-blue-200';
      case 'delivered':
        return 'bg-green-100/80 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100/80 text-gray-800 border border-gray-200';
    }
  };

  if (!orders || orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-4 glass-card">
          <p className="text-muted-foreground mb-3">No orders yet</p>
          <Button 
            onClick={() => navigate('/order')}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Place an Order
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-flame-inner via-flame-middle to-flame-outer opacity-0 group-hover:opacity-20 transition-opacity" />
          </Button>
        </Card>
      </motion.div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-2"
    >
      {Object.entries(
        orders.reduce((groups: { [key: string]: Order[] }, order) => {
          const date = format(new Date(order.created_at!), 'yyyy-MM-dd');
          if (!groups[date]) groups[date] = [];
          groups[date].push(order);
          return groups;
        }, {})
      ).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([date, dateOrders]) => (
        <div key={date} className="space-y-2">
          <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-1">
            <h2 className="text-xs font-medium text-muted-foreground">
              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </h2>
          </div>
          
          <motion.div variants={container} className="space-y-2">
            {dateOrders.map((order) => (
              <motion.div key={order.id} variants={item}>
                <Card className="p-3 glass-card hover:shadow-md transition-shadow duration-300">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium flex items-center gap-1">
                          <Flame className="w-3 h-3 text-accent" />
                          #{order.id.slice(-6)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {format(new Date(order.created_at!), 'h:mm a')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{order.address}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package2 className="w-3 h-3" />
                          <span>
                            {order.size} x {order.quantity} • {order.brand}
                          </span>
                        </div>
                      </div>

                      {isAdmin && order.delivery_person && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Assigned to: {order.delivery_person}
                        </div>
                      )}
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="mt-2">
                      {order.status === "pending" && (
                        <div className="flex flex-wrap gap-1">
                          {["Fahad", "Osingya", "Peter", "Steven"].map((person) => (
                            <Button
                              key={person}
                              variant="outline"
                              size="sm"
                              onClick={() => onAssignDelivery(order.id, person)}
                              className="text-xs py-0.5 h-6 hover:bg-accent hover:text-white transition-colors"
                            >
                              {person}
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      {order.status === "assigned" && (
                        <Button
                          size="sm"
                          onClick={() => onMarkDelivered(order.id)}
                          className="w-full bg-green-500 text-white hover:bg-green-600 h-7 text-xs relative overflow-hidden group"
                        >
                          <span className="relative z-10">Mark Delivered</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-0 group-hover:opacity-20 transition-opacity" />
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      ))}
    </motion.div>
  );
};
