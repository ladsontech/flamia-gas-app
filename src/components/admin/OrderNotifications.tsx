
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

  const getCustomerName = async (userId: string | null, description: string): Promise<string> => {
    // First try to get name from profile if we have user_id
    if (userId) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, display_name')
          .eq('id', userId)
          .single();
        
        if (profile?.full_name) return profile.full_name;
        if (profile?.display_name) return profile.display_name;
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }
    
    // Fallback to extracting contact info from description
    const lines = description.split('\n');
    const contactLine = lines.find(line => line.includes('Contact:'));
    if (contactLine) {
      return contactLine.split('Contact:')[1]?.trim() || 'Unknown Customer';
    }
    return 'Unknown Customer';
  };

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
        async (payload) => {
          const newOrder = payload.new as Order;
          const customerName = await getCustomerName(newOrder.user_id, newOrder.description);
          
          // Show toast notification
          toast({
            title: "New Order Received!",
            description: `Order from ${customerName}`,
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
  }, [toast, onNewOrder, getCustomerName]);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Bell className={`h-4 w-4 ${isListening ? 'text-green-600' : 'text-gray-400'}`} />
      <span>{isListening ? 'Listening for new orders' : 'Not connected'}</span>
    </div>
  );
};
