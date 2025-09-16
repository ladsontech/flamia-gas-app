import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bell, Package, Users, Truck, CheckCircle, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export interface NotificationItem {
  id: string;
  type: 'new_order' | 'order_assigned' | 'order_status' | 'new_referral' | 'commission';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export const NotificationDropdown = ({ 
  notifications, 
  onMarkAsRead, 
  onClearAll, 
  onClose 
}: NotificationDropdownProps) => {
  const navigate = useNavigate();
  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'new_order':
        return <Package className="h-4 w-4 text-primary" />;
      case 'order_assigned':
        return <Truck className="h-4 w-4 text-orange-500" />;
      case 'order_status':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'new_referral':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'commission':
        return <DollarSign className="h-4 w-4 text-emerald-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'new_order':
      case 'order_assigned':
      case 'order_status':
        navigate('/orders');
        break;
      case 'new_referral':
      case 'commission':
        navigate('/account');
        break;
      default:
        break;
    }
    
    onClose();
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const hasNotifications = notifications.length > 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium">Notifications</h3>
        {unreadNotifications.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            Clear all
          </Button>
        )}
      </div>

      <ScrollArea className="h-96">
        {!hasNotifications ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 cursor-pointer hover:bg-muted/50 ${
                  !notification.read ? 'bg-primary/5' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(notification.timestamp, 'MMM dd, h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};