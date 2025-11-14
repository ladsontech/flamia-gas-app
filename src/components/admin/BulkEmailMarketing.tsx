import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Send, Mail } from "lucide-react";

export const BulkEmailMarketing = () => {
  const [emails, setEmails] = useState<string[]>([]);
  const [manualEmails, setManualEmails] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

  const uniqueNormalized = (list: string[]) => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of list) {
      const e = raw.trim().toLowerCase();
      if (!e) continue;
      if (!seen.has(e)) {
        seen.add(e);
        out.push(e);
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
      let parsed: string[] = [];

      if (isCSV) {
        const text = await file.text();
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        parsed = lines
          .map(line => {
            const parts = line.split(',');
            return (parts[0] || "").trim();
          })
          .filter(email => emailRegex.test(email));
      } else {
        const XLSX = await import('xlsx');
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
        parsed = rows
          .map(row => String(row[0] || '').trim())
          .filter(email => emailRegex.test(email));
      }

      const combined = uniqueNormalized([...emails, ...parsed]);
      setEmails(combined);
      toast({
        title: "Contacts loaded",
        description: `Loaded ${parsed.length} emails. Total: ${combined.length}`
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
      // reset the input so same file can be re-selected if needed
      event.currentTarget.value = "";
    }
  };

  const handleAddManual = () => {
    if (!manualEmails.trim()) {
      toast({
        title: "No emails provided",
        description: "Enter comma-separated or line-separated emails to add.",
        variant: "destructive"
      });
      return;
    }
    const rawList = manualEmails
      .split(/[\s,;]+/g)
      .map(e => e.trim())
      .filter(Boolean);
    const valid = rawList.filter(e => emailRegex.test(e));
    if (valid.length === 0) {
      toast({
        title: "No valid emails",
        description: "Please check the format and try again.",
        variant: "destructive"
      });
      return;
    }
    const combined = uniqueNormalized([...emails, ...valid]);
    setEmails(combined);
    setManualEmails("");
    toast({
      title: "Emails added",
      description: `Added ${valid.length} emails. Total: ${combined.length}`
    });
  };

  const handleSendBulkEmail = async () => {
    if (emails.length === 0) {
      toast({
        title: "No recipients",
        description: "Upload or add emails first",
        variant: "destructive"
      });
      return;
    }
    if (!subject.trim()) {
      toast({
        title: "Missing subject",
        description: "Enter an email subject",
        variant: "destructive"
      });
      return;
    }
    if (!message.trim()) {
      toast({
        title: "Missing message",
        description: "Enter your email content",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      toast({
        title: "Sending emails",
        description: `Sending to ${emails.length} recipients...`,
      });
      const { data, error } = await supabase.functions.invoke('send-bulk-email', {
        body: {
          contacts: emails,
          subject: subject.trim(),
          message: message.trim(),
        }
      });
      if (error) {
        throw error;
      }
      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send emails');
      }
      toast({
        title: "Emails sent",
        description: `Sent to ${data.successCount}/${data.totalSent} recipients.`,
      });
      setEmails([]);
      setSubject("");
      setMessage("");
    } catch (error: any) {
      console.error('Error sending bulk emails:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send bulk emails",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-accent" />
        <p className="text-sm text-muted-foreground">Send promotional emails to your contacts</p>
      </div>

      <div>
        <Label htmlFor="email-upload" className="block text-sm font-medium mb-1.5">
          Upload Emails (CSV/Excel)
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="email-upload"
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
          First column should contain emails
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="manual-emails" className="text-sm">Add emails (comma or line separated)</Label>
        <Textarea
          id="manual-emails"
          placeholder="e.g. alice@example.com, bob@example.com"
          value={manualEmails}
          onChange={(e) => setManualEmails(e.target.value)}
          rows={2}
          className="resize-none text-sm"
        />
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            {emails.length > 0 ? `${emails.length} recipients` : 'No recipients added yet'}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleAddManual}>
              Add emails
            </Button>
            {emails.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setEmails([])}>
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email-subject" className="text-sm">Subject</Label>
        <Input
          id="email-subject"
          placeholder="e.g., New offers just for you"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={120}
          className="text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email-body" className="text-sm">Message</Label>
        <Textarea
          id="email-body"
          placeholder="Write your email..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="resize-none text-sm"
        />
        <p className="text-xs text-muted-foreground">
          {message.length} characters
        </p>
      </div>

      <Button
        onClick={handleSendBulkEmail}
        disabled={sending || emails.length === 0 || !subject.trim() || !message.trim()}
        className="w-full"
        size="sm"
      >
        <Send className="h-4 w-4 mr-2" />
        {sending ? "Sending..." : `Send to ${emails.length} Recipients`}
      </Button>
    </div>
  );
};



