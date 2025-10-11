
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Order } from "@/types/order";
import { PlusCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface OrdersListProps {
  orders: Order[];
  isAdmin: boolean;
}

export const OrdersList = ({ 
  orders, 
  isAdmin
}: OrdersListProps) => {
  const navigate = useNavigate();

  if (!orders || orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-3 glass-card">
          <p className="text-sm text-muted-foreground mb-2">No orders yet</p>
          <Button 
            onClick={() => navigate('/order')}
            size="sm"
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="text-xs sm:text-sm">Order Now</span>
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

  // Group orders by date and sort them
  const groupedOrders = orders.reduce((groups: { [key: string]: Order[] }, order) => {
    const date = format(new Date(order.created_at), 'yyyy-MM-dd');
    if (!groups[date]) groups[date] = [];
    groups[date].push(order);
    return groups;
  }, {});

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedOrders).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-2"
    >
      {sortedDates.map((date) => {
        const dateOrders = groupedOrders[date];
        // Reset counter for each date
        let orderCounter = 1;
        
        return (
          <div key={date} className="space-y-2">
            <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-1">
              <h2 className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                {format(new Date(date), 'EEE, MMM d, yyyy')}
              </h2>
            </div>
            
            <motion.div variants={container} className="space-y-2">
              {dateOrders.map((order) => (
                <motion.div key={order.id} variants={item}>
                  <Card className="p-3 glass-card hover:shadow-md transition-shadow duration-300">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="flex items-center gap-1">
                            <span className="h-4 w-4 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[10px] font-medium">
                              {orderCounter++}
                            </span>
                            <span className="text-[10px] sm:text-xs font-medium">Order</span>
                          </span>
                          <span className="text-[10px] sm:text-xs text-muted-foreground">
                            {format(new Date(order.created_at), 'h:mm a')}
                          </span>
                        </div>
                        
                        <div className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {order.description}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        );
      })}
    </motion.div>
  );
};
