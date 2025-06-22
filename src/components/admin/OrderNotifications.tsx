
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bell } from 'lucide-react';
import { Order } from '@/types/order';

interface OrderNotificationsProps {
  onNewOrder?: (order: Order) => void;
}

export const OrderNotifications = ({ onNewOrder }: OrderNotificationsProps) => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Set up real-time subscription for new orders
    const channel = supabase
      .channel('order-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          const newOrder = payload.new as Order;
          
          // Show toast notification
          toast({
            title: "New Order Received!",
            description: `Order from ${extractCustomerInfo(newOrder.description)}`,
            duration: 5000,
          });

          // Call callback if provided
          if (onNewOrder) {
            onNewOrder(newOrder);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsListening(true);
          console.log('Order notifications enabled');
        } else if (status === 'CHANNEL_ERROR') {
          setIsListening(false);
          console.error('Error subscribing to order notifications');
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setIsListening(false);
    };
  }, [toast, onNewOrder]);

  const extractCustomerInfo = (description: string) => {
    const lines = description.split('\n');
    const contactLine = lines.find(line => line.includes('*Contact:*'));
    if (contactLine) {
      return contactLine.split('*Contact:*')[1]?.trim() || 'Unknown';
    }
    return 'Unknown customer';
  };

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Bell className={`h-4 w-4 ${isListening ? 'text-green-600' : 'text-gray-400'}`} />
      <span>{isListening ? 'Listening for new orders' : 'Not connected'}</span>
    </div>
  );
};
