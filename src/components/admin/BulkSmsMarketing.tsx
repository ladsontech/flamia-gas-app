import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, MessageSquare, Send } from "lucide-react";

export const BulkSmsMarketing = () => {
  const [contacts, setContacts] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      
      // Extract phone numbers (assumes first column or single column with phone numbers)
      const phoneNumbers = lines
        .map(line => {
          const parts = line.split(',');
          return parts[0].trim();
        })
        .filter(phone => {
          // Basic validation for phone numbers
          const cleaned = phone.replace(/[^\d+]/g, '');
          return cleaned.length >= 10;
        });

      setContacts(phoneNumbers);
      toast({
        title: "Success",
        description: `Loaded ${phoneNumbers.length} contacts from CSV`
      });
    } catch (error) {
      console.error('Error reading CSV:', error);
      toast({
        title: "Error",
        description: "Failed to read CSV file",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSendBulkSms = async () => {
    if (contacts.length === 0) {
      toast({
        title: "No contacts",
        description: "Please upload a CSV file with contacts first",
        variant: "destructive"
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "No message",
        description: "Please enter a message to send",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      // TODO: Implement actual bulk SMS sending via edge function
      // This is a placeholder for the bulk SMS implementation
      
      toast({
        title: "Sending SMS",
        description: `Sending message to ${contacts.length} contacts...`,
      });

      // Simulate sending
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "SMS Sent",
        description: `Successfully sent SMS to ${contacts.length} contacts`,
      });

      // Clear form
      setContacts([]);
      setMessage("");
    } catch (error) {
      console.error('Error sending bulk SMS:', error);
      toast({
        title: "Error",
        description: "Failed to send bulk SMS",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Bulk SMS Marketing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload CSV */}
          <div>
            <label htmlFor="csv-upload" className="block text-sm font-medium mb-2">
              Upload Contacts (CSV)
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={uploading}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                disabled={uploading}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              CSV should have phone numbers in the first column
            </p>
          </div>

          {/* Show loaded contacts count */}
          {contacts.length > 0 && (
            <div className="bg-accent/20 rounded-lg p-3">
              <p className="text-sm font-medium">
                {contacts.length} contacts loaded
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ready to send messages
              </p>
            </div>
          )}

          {/* Message input */}
          <div>
            <label htmlFor="sms-message" className="block text-sm font-medium mb-2">
              Message
            </label>
            <Textarea
              id="sms-message"
              placeholder="Enter your marketing message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {message.length} characters
            </p>
          </div>

          {/* Send button */}
          <Button
            onClick={handleSendBulkSms}
            disabled={sending || contacts.length === 0 || !message.trim()}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {sending ? "Sending..." : `Send SMS to ${contacts.length} Contacts`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
