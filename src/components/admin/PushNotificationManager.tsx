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
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-sm">Title</Label>
        <Input
          id="title"
          placeholder="e.g., New Promotion Available"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={50}
          className="text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message" className="text-sm">Message</Label>
        <Textarea
          id="message"
          placeholder="Enter your notification message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={200}
          rows={3}
          className="text-sm resize-none"
        />
        <p className="text-xs text-muted-foreground">
          {message.length}/200
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="targetPage" className="text-sm">Target Page</Label>
        <Input
          id="targetPage"
          placeholder="/"
          value={targetPage}
          onChange={(e) => setTargetPage(e.target.value)}
          className="text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Redirect users on click
        </p>
      </div>

      <Button
        onClick={handleSend}
        disabled={loading || !title.trim() || !message.trim()}
        className="w-full"
        size="sm"
      >
        <Send className="h-4 w-4 mr-2" />
        {loading ? "Sending..." : "Send Notification"}
      </Button>
    </div>
  );
};
