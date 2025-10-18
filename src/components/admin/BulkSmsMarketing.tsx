import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Send } from "lucide-react";

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
      const { supabase } = await import("@/integrations/supabase/client");
      
      toast({
        title: "Sending SMS",
        description: `Sending message to ${contacts.length} contacts...`,
      });

      const { data, error } = await supabase.functions.invoke('send-bulk-sms', {
        body: {
          contacts,
          message: message.trim(),
        }
      });

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send SMS');
      }

      toast({
        title: "SMS Sent Successfully",
        description: `Sent to ${data.successCount}/${data.totalSent} contacts. Total cost: ${data.totalCost}`,
      });

      console.log('Bulk SMS results:', data);

      // Clear form on success
      setContacts([]);
      setMessage("");
    } catch (error: any) {
      console.error('Error sending bulk SMS:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send bulk SMS",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload CSV */}
      <div>
        <label htmlFor="csv-upload" className="block text-sm font-medium mb-1.5">
          Upload Contacts (CSV)
        </label>
        <div className="flex items-center gap-2">
          <Input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={uploading}
            className="flex-1 text-sm"
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
          CSV with phone numbers in first column
        </p>
      </div>

      {/* Show loaded contacts count */}
      {contacts.length > 0 && (
        <div className="bg-accent/20 rounded-lg p-2.5">
          <p className="text-sm font-medium">
            {contacts.length} contacts loaded
          </p>
        </div>
      )}

      {/* Message input */}
      <div>
        <label htmlFor="sms-message" className="block text-sm font-medium mb-1.5">
          Message
        </label>
        <Textarea
          id="sms-message"
          placeholder="Enter your marketing message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="resize-none text-sm"
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
        size="sm"
      >
        <Send className="h-4 w-4 mr-2" />
        {sending ? "Sending..." : `Send to ${contacts.length} Contacts`}
      </Button>
    </div>
  );
};
