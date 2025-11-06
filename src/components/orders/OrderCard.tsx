import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight, Flame, Clock, CheckCircle, XCircle, Package } from "lucide-react";
import { format } from "date-fns";

interface Order {
  id: string;
  created_at: string;
  description: string;
  delivery_man_id?: string | null;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assigned_at?: string | null;
  user_id?: string | null;
  delivery_address?: string | null;
  total_amount?: number | null;
}

interface OrderInfo {
  brand: string;
  size: string;
  price: string;
}

interface OrderCardProps {
  order: Order;
}

const extractOrderInfo = (description: string): OrderInfo => {
  const brandMatch = description.match(/Brand:\s*([^,\n]+)/i);
  const sizeMatch = description.match(/Size:\s*([^,\n]+)/i);
  const priceMatch = description.match(/Price:\s*UGX\s*([\d,]+)/i);
  
  return {
    brand: brandMatch ? brandMatch[1].trim() : 'Gas',
    size: sizeMatch ? sizeMatch[1].trim() : '',
    price: priceMatch ? priceMatch[1].trim() : ''
  };
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-orange-500" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Package className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-50';
    case 'completed':
      return 'text-orange-600 bg-orange-50';
    case 'cancelled':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export const OrderCard = ({ order }: OrderCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const orderInfo = extractOrderInfo(order.description);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CollapsibleTrigger className="w-full">
          <div className="p-3 flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Flame className="w-6 h-6 text-accent" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0 text-left space-y-1">
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              {orderInfo.brand && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Brand:</span> <span className="font-medium">{orderInfo.brand}</span>
                </div>
              )}
              {orderInfo.size && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Size:</span> <span className="font-medium">{orderInfo.size}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-0.5">
                <span>{format(new Date(order.created_at), 'dd/MM/yyyy, h:mm a')}</span>
              </div>
            </div>
            
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="text-right">
                <p className="font-semibold text-sm">
                  {order.total_amount ? order.total_amount.toLocaleString() : orderInfo.price}
                </p>
                <p className="text-xs text-muted-foreground">UGX</p>
              </div>
              <ChevronRight 
                className={`w-4 h-4 text-muted-foreground transition-transform ${
                  isOpen ? 'rotate-90' : ''
                }`} 
              />
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="border-t px-3 py-3 bg-muted/30 space-y-3">
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
              
              {order.delivery_address && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Delivery Address</p>
                  <p className="text-sm">{order.delivery_address}</p>
                </div>
              )}
              
              <div>
                <p className="text-xs text-muted-foreground mb-1">Order Details</p>
                <p className="text-sm whitespace-pre-line">{order.description}</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-1">Order ID</p>
                <p className="text-sm font-mono">#{order.id.slice(0, 8)}</p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
