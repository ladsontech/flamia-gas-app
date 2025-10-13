import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const PushNotificationManager = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetPage, setTargetPage] = useState("/");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please enter both title and message",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: { title, message, targetPage }
      });

      if (error) throw error;

      toast({
        title: "Notifications Sent",
        description: `Successfully sent to ${data.sent} subscribers`,
      });

      // Clear form
      setTitle("");
      setMessage("");
      setTargetPage("/");
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Notification Title</Label>
        <Input
          id="title"
          placeholder="Enter notification title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={50}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Enter notification message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={200}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          {message.length}/200 characters
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetPage">Target Page (URL)</Label>
        <Input
          id="targetPage"
          placeholder="/"
          value={targetPage}
          onChange={(e) => setTargetPage(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Users will be redirected here when clicking the notification
        </p>
      </div>

      <Button
        onClick={handleSend}
        disabled={loading || !title.trim() || !message.trim()}
        className="w-full"
      >
        <Send className="h-4 w-4 mr-2" />
        {loading ? "Sending..." : "Send Push Notification"}
      </Button>
    </div>
  );
};
