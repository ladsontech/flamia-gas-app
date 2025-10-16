import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { pushNotificationService } from "@/services/pushNotifications";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const PushNotificationPrompt = () => {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAndAutoSubscribe = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isSubscribed = await pushNotificationService.getSubscriptionStatus();
      const permission = Notification.permission;

      // If already subscribed, do nothing
      if (isSubscribed) return;

      // If permission already granted, automatically subscribe
      if (permission === 'granted') {
        try {
          await pushNotificationService.subscribe();
          toast({
            title: "Notifications Enabled",
            description: "You'll receive important updates about your orders",
          });
        } catch (error) {
          console.error('Auto-subscribe error:', error);
        }
        return;
      }

      // Check if we should show the prompt (weekly reminder)
      const lastDismissed = localStorage.getItem('push-notification-last-dismissed');
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
      
      if (permission === 'default') {
        // Show if never dismissed or if a week has passed since last dismissal
        if (!lastDismissed || parseInt(lastDismissed) < oneWeekAgo) {
          setTimeout(() => setShow(true), 2000);
        }
      }
    };

    checkAndAutoSubscribe();
  }, [toast]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const permission = Notification.permission;
        if (permission === 'granted') {
          pushNotificationService.subscribe().catch((e) => console.error('Auth subscribe error:', e));
        } else if (permission === 'default') {
          setTimeout(() => setShow(true), 1500);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const permission = await pushNotificationService.requestPermission();
      
      if (permission === 'granted') {
        await pushNotificationService.subscribe();
        toast({
          title: "Notifications Enabled",
          description: "You'll receive important updates about your orders",
        });
        setShow(false);
      } else {
        toast({
          title: "Permission Denied",
          description: "You can enable notifications later from your browser settings",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast({
        title: "Error",
        description: "Failed to enable notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      // Store timestamp of dismissal for weekly reminders
      localStorage.setItem('push-notification-last-dismissed', Date.now().toString());
    }
  };

  const handleDismiss = () => {
    setShow(false);
    // Store timestamp so we can remind them again in a week
    localStorage.setItem('push-notification-last-dismissed', Date.now().toString());
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="border-2 border-primary shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold mb-1">Stay Updated</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Get notified about your order status, special offers, and more
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleEnable}
                  disabled={loading}
                  size="sm"
                  className="flex-1"
                >
                  {loading ? 'Enabling...' : 'Enable Notifications'}
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
