import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "./useUserRole";
import { useToast } from "@/hooks/use-toast";
import type { NotificationItem } from "@/components/notifications/NotificationDropdown";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const { userRole, loading } = useUserRole();
  const { toast } = useToast();

  const addNotification = useCallback((notification: Omit<NotificationItem, 'id'>) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: crypto.randomUUID(),
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Show toast for new notifications
    toast({
      title: notification.title,
      description: notification.description,
      duration: 3000,
    });

    // Also show a browser notification (via service worker) when permitted
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        navigator.serviceWorker?.getRegistration()?.then((reg) => {
          reg?.showNotification(notification.title, {
            body: notification.description,
            icon: '/images/icon.png',
            badge: '/images/icon.png',
            tag: 'flamia-notification',
          });
        });
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            navigator.serviceWorker?.getRegistration()?.then((reg) => {
              reg?.showNotification(notification.title, {
                body: notification.description,
                icon: '/images/icon.png',
                badge: '/images/icon.png',
                tag: 'flamia-notification',
              });
            });
          }
        });
      }
    }
  }, [toast]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  useEffect(() => {
    if (loading) return;

    const channels: any[] = [];

    // Admin notifications: all new orders
    if (userRole === 'super_admin') {
      const orderChannel = supabase
        .channel('admin-order-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'orders'
          },
          (payload) => {
            const order = payload.new;
            addNotification({
              type: 'new_order',
              title: 'New Order Received',
              description: `Order from ${extractCustomerInfo(order.description)}`,
              timestamp: new Date(),
              read: false,
              data: order
            });
          }
        )
        .subscribe();
      channels.push(orderChannel);
    }

    // Delivery man notifications: orders assigned to them
    if (userRole === 'delivery_man') {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          const assignedOrderChannel = supabase
            .channel('delivery-order-notifications')
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `delivery_man_id=eq.${user.id}`
              },
              (payload) => {
                const order = payload.new;
                if (order.status === 'assigned') {
                  addNotification({
                    type: 'order_assigned',
                    title: 'New Order Assigned',
                    description: `You have been assigned a delivery order`,
                    timestamp: new Date(),
                    read: false,
                    data: order
                  });
                }
              }
            )
            .subscribe();
          channels.push(assignedOrderChannel);
        }
      });
    }

    // User notifications: referrals and order status updates
    if (userRole === 'user') {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          // Referral notifications
          const referralChannel = supabase
            .channel('user-referral-notifications')
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'referrals',
                filter: `referrer_id=eq.${user.id}`
              },
              (payload) => {
                const referral = payload.new;
                addNotification({
                  type: 'new_referral',
                  title: 'New Referral',
                  description: `Someone used your referral code: ${referral.referral_code}`,
                  timestamp: new Date(),
                  read: false,
                  data: referral
                });
              }
            )
            .subscribe();
          channels.push(referralChannel);

          // Order status notifications
          const orderStatusChannel = supabase
            .channel('user-order-notifications')
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `user_id=eq.${user.id}`
              },
              (payload) => {
                const order = payload.new;
                const oldOrder = payload.old;
                
                if (!oldOrder || order.status !== oldOrder.status) {
                  let title = 'Order Update';
                  let description = `Your order status changed to: ${order.status}`;

                  if (order.status === 'in_progress') {
                    title = 'Order In Progress';
                    description = 'Your order is now being prepared for delivery';
                  } else if (order.status === 'completed') {
                    title = 'Order Completed';
                    description = 'Your order has been successfully delivered';
                  }

                  addNotification({
                    type: 'order_status',
                    title,
                    description,
                    timestamp: new Date(),
                    read: false,
                    data: order
                  });
                }
              }
            )
            .subscribe();
          channels.push(orderStatusChannel);
        }
      });
    }

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [userRole, loading, addNotification]);

  const extractCustomerInfo = (description: string) => {
    const lines = description.split('\n');
    const contactLine = lines.find(line => line.includes('*Contact:*'));
    if (contactLine) {
      return contactLine.split('*Contact:*')[1]?.trim() || 'Unknown';
    }
    return 'Unknown customer';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearAll,
    addNotification
  };
};