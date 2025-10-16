import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "./useUserRole";
import { useToast } from "@/hooks/use-toast";
import type { NotificationItem } from "@/components/notifications/NotificationDropdown";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef(false);
  const { userRole, loading } = useUserRole();
  const { toast } = useToast();

  // Protect against external script interference
  useEffect(() => {
    if (typeof window === 'undefined' || initializationRef.current) return;
    
    const initializeWithDelay = () => {
      requestAnimationFrame(() => {
        if (!initializationRef.current) {
          initializationRef.current = true;
          setIsInitialized(true);
        }
      });
    };

    // Delay initialization to avoid ad script conflicts
    const timeoutId = setTimeout(initializeWithDelay, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const getTargetPage = (notification: Omit<NotificationItem, 'id'>): string => {
    if (notification.type === 'new_order' || notification.type === 'order_assigned' || notification.type === 'order_status') {
      return '/orders';
    }
    if (notification.type === 'new_referral' || notification.type === 'commission') {
      return '/account';
    }
    return '/';
  };

  const addNotification = useCallback(async (notification: Omit<NotificationItem, 'id'>, targetUserId?: string) => {
    if (!isInitialized) return;
    
    try {
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

      // Send FCM push notification to target user if specified
      if (targetUserId) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            await supabase.functions.invoke('send-targeted-push', {
              body: {
                userId: targetUserId,
                title: notification.title,
                body: notification.description,
                targetPage: getTargetPage(notification)
              }
            });
          }
        } catch (error) {
          console.error('Failed to send FCM push notification:', error);
        }
      }
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  }, [toast, isInitialized]);

  const markAsRead = useCallback((id: string) => {
    if (!isInitialized) return;
    try {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [isInitialized]);

  const clearAll = useCallback(() => {
    if (!isInitialized) return;
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, [isInitialized]);

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
    if (loading || !isInitialized) return;

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
          async (payload) => {
            const order = payload.new;
            const customerName = await getCustomerName(order.user_id, order.description);
            const { data: { user } } = await supabase.auth.getUser();
            addNotification({
              type: 'new_order',
              title: 'New Order Received',
              description: `Order from ${customerName}`,
              timestamp: new Date(),
              read: false,
              data: order
            }, user?.id);
          }
        )
        .subscribe();
      channels.push(orderChannel);

      // Admin notifications from database
      const adminNotificationChannel = supabase
        .channel('admin-db-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications'
          },
          async (payload) => {
            const notification = payload.new as any;
            // Check if this notification is for the current admin user
            const { data: { user } } = await supabase.auth.getUser();
            if (user && notification.user_id === user.id) {
              addNotification({
                type: notification.type,
                title: notification.title,
                description: notification.message,
                timestamp: new Date(notification.created_at),
                read: notification.read,
                data: notification.data
              });
            }
          }
        )
        .subscribe();
      channels.push(adminNotificationChannel);
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
                  }, user.id);
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
          // Database notifications for users
          const userNotificationChannel = supabase
            .channel('user-db-notifications')
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
              },
              (payload) => {
                const notification = payload.new as any;
                addNotification({
                  type: notification.type,
                  title: notification.title,
                  description: notification.message,
                  timestamp: new Date(notification.created_at),
                  read: notification.read,
                  data: notification.data
                });
              }
            )
            .subscribe();
          channels.push(userNotificationChannel);

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
                }, user.id);
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
                  }, user.id);
                }
              }
            )
            .subscribe();
          channels.push(orderStatusChannel);

          // Commission notifications - listen for new commissions and join with referrals table
          const commissionChannel = supabase
            .channel('user-commission-notifications')
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'commissions'
              },
              async (payload) => {
                const commission = payload.new as any;
                
                // Fetch the full commission with referral info to check if it belongs to this user
                try {
                  const { data: commissionData } = await supabase
                    .from('commissions')
                    .select(`
                      *,
                      referrals!inner(referrer_id, referral_code)
                    `)
                    .eq('id', commission.id)
                    .eq('referrals.referrer_id', user.id)
                    .maybeSingle();
                    
                  if (commissionData) {
                    const amount = Number(commission.amount) || 0;
                    addNotification({
                      type: 'commission',
                      title: 'New Commission Earned!',
                      description: `UGX ${amount.toLocaleString('en-UG')} commission from referral`,
                      timestamp: new Date(),
                      read: false,
                      data: commission
                    }, user.id);
                  }
                } catch (error) {
                  console.error('Error fetching commission data for notification:', error);
                }
              }
            )
            .subscribe();
          channels.push(commissionChannel);
        }
      });
    }

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [userRole, loading, addNotification, getCustomerName, isInitialized]);

  const unreadCount = isInitialized ? notifications.filter(n => !n.read).length : 0;

  return {
    notifications: isInitialized ? notifications : [],
    unreadCount,
    markAsRead,
    clearAll,
    addNotification
  };
};