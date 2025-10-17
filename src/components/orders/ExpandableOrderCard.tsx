import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Clock, Package, Truck, CheckCircle, User, MapPin, Phone, ChevronDown, ChevronUp, XCircle, Navigation } from "lucide-react";
import { format } from "date-fns";
import { OrderService } from "@/services/orderService";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  created_at: string;
  description: string;
  delivery_man_id?: string | null;
  status?: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | null;
  assigned_at?: string | null;
  user_id?: string;
  delivery_address?: string | null;
  delivery_latitude?: number | null;
  delivery_longitude?: number | null;
  total_amount?: number | null;
  delivery_man?: {
    name: string;
    email: string;
  } | null;
}

interface OrderInfo {
  brand?: string;
  size?: string;
  price?: string;
  quantity?: string;
  contact?: string;
  address?: string;
  type?: string;
  item?: string;
  total?: string;
}

interface ExpandableOrderCardProps {
  order: Order;
  userRole: 'user' | 'delivery_man';
}

export const ExpandableOrderCard = ({ order, userRole }: ExpandableOrderCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // Auto-collapse completed orders for delivery men after 2 seconds
  useEffect(() => {
    if (userRole === 'delivery_man' && order.status === 'completed' && isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [order.status, isOpen, userRole]);

  const extractOrderInfo = (description: string): OrderInfo => {
    const lines = description.split('\n');
    const info: OrderInfo = {};
    
    lines.forEach(line => {
      if (line.includes('Brand:') && !line.includes('*Brand:*')) info.brand = line.split('Brand:')[1]?.trim();
      if (line.includes('Size:') && !line.includes('*Size:*')) info.size = line.split('Size:')[1]?.trim();
      if (line.includes('Price:') && !line.includes('*Price:*')) info.price = line.split('Price:')[1]?.trim();
      if (line.includes('Quantity:') && !line.includes('*Quantity:*')) info.quantity = line.split('Quantity:')[1]?.trim();
      if (line.includes('Contact:') && !line.includes('*Contact:*')) info.contact = line.split('Contact:')[1]?.trim();
      if (line.includes('Address:') && !line.includes('*Address:*')) info.address = line.split('Address:')[1]?.trim();
      if (line.includes('Order Type:') && !line.includes('*Order Type:*')) info.type = line.split('Order Type:')[1]?.trim();
      if (line.includes('Item:') && !line.includes('*Item:*')) info.item = line.split('Item:')[1]?.trim();
      if (line.includes('Total Amount:') && !line.includes('*Total Amount:*')) info.total = line.split('Total Amount:')[1]?.trim();
      
      if (line.includes('*Brand:*')) info.brand = line.split('*Brand:*')[1]?.trim();
      if (line.includes('*Size:*')) info.size = line.split('*Size:*')[1]?.trim();
      if (line.includes('*Price:*')) info.price = line.split('*Price:*')[1]?.trim();
      if (line.includes('*Quantity:*')) info.quantity = line.split('*Quantity:*')[1]?.trim();
      if (line.includes('*Contact:*')) info.contact = line.split('*Contact:*')[1]?.trim();
      if (line.includes('*Address:*')) info.address = line.split('*Address:*')[1]?.trim();
      if (line.includes('*Order Type:*')) info.type = line.split('*Order Type:*')[1]?.trim();
      if (line.includes('*Item:*')) info.item = line.split('*Item:*')[1]?.trim();
      if (line.includes('*Total Amount:*')) info.total = line.split('*Total Amount:*')[1]?.trim();
    });
    
    return info;
  };

  const getStatusIcon = (status?: string | null) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'assigned': return <User className="h-4 w-4" />;
      case 'in_progress': return <Truck className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status?: string | null) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
      assigned: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Assigned' },
      in_progress: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelled' }
    };
    
    const config = statusConfig[(status || 'pending') as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge className={`${config.color} border font-medium`}>
        <div className="flex items-center gap-1">
          {getStatusIcon(status)}
          {config.label}
        </div>
      </Badge>
    );
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await OrderService.updateOrderStatus(order.id, newStatus);
      toast({
        title: "Success",
        description: `Order marked as ${newStatus.replace('_', ' ')}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const orderInfo = extractOrderInfo(order.description);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CollapsibleTrigger className="w-full">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(order.status)}
                <div className="text-left">
                  <div className="font-semibold text-sm">
                    {orderInfo.item || orderInfo.brand || 'Order'} {orderInfo.size && `- ${orderInfo.size}`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(order.created_at), 'MMM d, yyyy • h:mm a')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(order.status)}
                {orderInfo.total && (
                  <div className="font-semibold text-primary hidden sm:block">
                    {orderInfo.total}
                  </div>
                )}
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t px-4 pb-4 pt-3 space-y-4">
            {/* Order Details */}
            {(orderInfo.brand || orderInfo.size || orderInfo.quantity || orderInfo.type) && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">ORDER DETAILS</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {orderInfo.type && (
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <div className="font-medium">{orderInfo.type}</div>
                    </div>
                  )}
                  {orderInfo.brand && (
                    <div>
                      <span className="text-muted-foreground">Brand:</span>
                      <div className="font-medium">{orderInfo.brand}</div>
                    </div>
                  )}
                  {orderInfo.size && (
                    <div>
                      <span className="text-muted-foreground">Size:</span>
                      <div className="font-medium">{orderInfo.size}</div>
                    </div>
                  )}
                  {orderInfo.quantity && (
                    <div>
                      <span className="text-muted-foreground">Quantity:</span>
                      <div className="font-medium">{orderInfo.quantity}</div>
                    </div>
                  )}
                  {orderInfo.price && (
                    <div>
                      <span className="text-muted-foreground">Price:</span>
                      <div className="font-medium">{orderInfo.price}</div>
                    </div>
                  )}
                  {orderInfo.total && (
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <div className="font-medium text-primary">{orderInfo.total}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Customer/Delivery Info */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">DELIVERY INFORMATION</h4>
              <div className="space-y-2 text-sm">
                {orderInfo.contact && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{orderInfo.contact}</span>
                  </div>
                )}
                {orderInfo.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <span className="break-words">{orderInfo.address}</span>
                  </div>
                )}
                {(order.delivery_latitude && order.delivery_longitude && userRole === 'delivery_man') && (
                  <div className="mt-2 p-2 bg-muted/30 rounded border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Navigation className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-mono">
                          {order.delivery_latitude.toFixed(6)}, {order.delivery_longitude.toFixed(6)}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${order.delivery_latitude},${order.delivery_longitude}`;
                          window.open(url, '_blank');
                        }}
                      >
                        Navigate
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Person Info (for users) */}
            {userRole === 'user' && order.delivery_man && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">DELIVERY PERSON</h4>
                <div className="flex items-center gap-2 text-sm p-2 bg-blue-50 rounded">
                  <User className="h-4 w-4 text-blue-600" />
                  <span><strong>{order.delivery_man.name}</strong></span>
                  {order.assigned_at && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      Assigned {format(new Date(order.assigned_at), 'MMM d, h:mm a')}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Man Actions */}
            {userRole === 'delivery_man' && order.status !== 'completed' && order.status !== 'cancelled' && (
              <div className="flex gap-2 pt-2">
                {order.status === 'assigned' && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus('in_progress')}
                    disabled={isUpdating}
                    className="flex-1"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Start Delivery
                  </Button>
                )}
                {order.status === 'in_progress' && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus('completed')}
                    disabled={isUpdating}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Completed
                  </Button>
                )}
              </div>
            )}

            {/* Order ID */}
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Order ID: {order.id.slice(0, 8)}...
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
