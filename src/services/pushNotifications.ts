import { supabase } from "@/integrations/supabase/client";
import { getFirebaseMessaging, getToken, onMessage } from "@/config/firebase";

export const pushNotificationService = {
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    return await Notification.requestPermission();
  },

  async subscribe(): Promise<string | null> {
    if (!('serviceWorker' in navigator)) {
      console.error('Service workers not supported');
      return null;
    }

    try {
      const messaging = getFirebaseMessaging();
      if (!messaging) {
        console.error('Firebase Messaging not available');
        return null;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return null;
      }

      // Get FCM token
      const registration = await navigator.serviceWorker.ready;
      const token = await getToken(messaging, {
        vapidKey: 'BHZicL5xWcu2_631X8golREEl22KTPsFgrmgxIbduXL_7lxhEVB8Zn_FV9CofzyVT0x8GVZVZe-op4y44D_fxww',
        serviceWorkerRegistration: registration
      });

      if (token) {
        // Save token to database
        await this.saveSubscription(token);
        
        // Listen for foreground messages
        onMessage(messaging, (payload) => {
          console.log('Message received in foreground:', payload);
          if (payload.notification) {
            new Notification(payload.notification.title || 'New notification', {
              body: payload.notification.body,
              icon: payload.notification.icon || '/icon.png'
            });
          }
        });
      }
      
      return token;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  },

  async saveSubscription(fcmToken: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        fcm_token: fcmToken,
        endpoint: `fcm:${fcmToken}`, // Use FCM token as endpoint identifier
        p256dh: '',
        auth: ''
      }, {
        onConflict: 'endpoint'
      });
  },

  async unsubscribe(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Remove from database
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);
      
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  },

  async getSubscriptionStatus(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    try {
      const { data } = await supabase
        .from('push_subscriptions')
        .select('fcm_token')
        .eq('user_id', user.id)
        .single();
      
      return !!data?.fcm_token;
    } catch (error) {
      return false;
    }
  }
};
