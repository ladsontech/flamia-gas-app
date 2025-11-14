import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Send, Phone } from "lucide-react";

export const BulkSmsMarketing = () => {
  const [contacts, setContacts] = useState<string[]>([]);
  const [manualNumbers, setManualNumbers] = useState<string>("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const uniqueNormalized = (list: string[]) => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of list) {
      const normalized = raw.replace(/[^\d+]/g, '').trim();
      if (!normalized) continue;
      if (normalized.length < 10) continue;
      if (!seen.has(normalized)) {
        seen.add(normalized);
        out.push(normalized);
      }
    }
    return out;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isCSV = file.name.endsWith('.csv');
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (!isCSV && !isExcel) {
      toast({
        title: "Invalid file",
        description: "Please upload a CSV or Excel file",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      let phoneNumbers: string[] = [];

      if (isCSV) {
        const text = await file.text();
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        
        phoneNumbers = lines
          .map(line => {
            const parts = line.split(',');
            return parts[0].trim();
          })
          .filter(phone => {
            const cleaned = phone.replace(/[^\d+]/g, '');
            return cleaned.length >= 10;
          });
      } else {
        // Handle Excel files
        const XLSX = await import('xlsx');
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
        
        phoneNumbers = rows
          .map(row => String(row[0] || '').trim())
          .filter(phone => {
            const cleaned = phone.replace(/[^\d+]/g, '');
            return cleaned.length >= 10;
          });
      }

      const combined = uniqueNormalized([...contacts, ...phoneNumbers]);
      setContacts(combined);
      toast({
        title: "Success",
        description: `Loaded ${phoneNumbers.length} contacts. Total: ${combined.length}`
      });
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "Error",
        description: "Failed to read file",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // allow reselecting the same file
      event.currentTarget.value = "";
    }
  };

  const handleAddManualNumbers = () => {
    if (!manualNumbers.trim()) {
      toast({
        title: "No numbers provided",
        description: "Enter comma-separated or line-separated phone numbers to add.",
        variant: "destructive"
      });
      return;
    }
    const pieces = manualNumbers.split(/[\s,;]+/g).map(p => p.trim()).filter(Boolean);
    const valid = pieces
      .map(p => p.replace(/[^\d+]/g, ''))
      .filter(p => p.length >= 10);
    if (valid.length === 0) {
      toast({
        title: "No valid numbers",
        description: "Please check the format and try again.",
        variant: "destructive"
      });
      return;
    }
    const combined = uniqueNormalized([...contacts, ...valid]);
    setContacts(combined);
    setManualNumbers("");
    toast({
      title: "Numbers added",
      description: `Added ${valid.length} numbers. Total: ${combined.length}`
    });
  };

  const handleSendBulkSms = async () => {
    if (contacts.length === 0) {
      toast({
        title: "No contacts",
        description: "Please upload or add contacts first",
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
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4 text-accent" />
        <p className="text-sm text-muted-foreground">Send bulk SMS to your audience</p>
      </div>

      {/* Upload CSV */}
      <div>
        <label htmlFor="csv-upload" className="block text-sm font-medium mb-1.5">
          Upload Contacts (CSV/Excel)
        </label>
        <div className="flex items-center gap-2">
          <Input
            id="csv-upload"
            type="file"
            accept=".csv,.xlsx,.xls"
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
          CSV or Excel file with phone numbers in first column
        </p>
      </div>

      {/* Manual add */}
      <div className="space-y-1.5">
        <Label htmlFor="manual-numbers" className="text-sm">Add numbers (comma or line separated)</Label>
        <Textarea
          id="manual-numbers"
          placeholder="+2567..., 2567..., 07..."
          value={manualNumbers}
          onChange={(e) => setManualNumbers(e.target.value)}
          rows={2}
          className="resize-none text-sm"
        />
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            {contacts.length > 0 ? `${contacts.length} contacts ready` : 'No contacts added yet'}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleAddManualNumbers}>
              Add numbers
            </Button>
            {contacts.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setContacts([])}>
                Clear
              </Button>
            )}
          </div>
        </div>
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
