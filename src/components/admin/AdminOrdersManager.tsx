import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminOrdersDashboard } from "./AdminOrdersDashboard";
import { Package, ShoppingBag, MessageSquare, Flame, Upload, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

export const AdminOrdersManager = () => {
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  // Bulk SMS state
  const [contacts, setContacts] = useState<string[]>([]);
  const [smsMessage, setSmsMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);

  // Push notification state
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [targetPage, setTargetPage] = useState("/");
  const [notifLoading, setNotifLoading] = useState(false);

  // Handle Excel/CSV file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const isCsv = file.name.endsWith('.csv');

    if (!isExcel && !isCsv) {
      toast({
        title: "Invalid file",
        description: "Please upload a CSV or Excel file",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      if (isExcel) {
        // Parse Excel file
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][];
        
        const phoneNumbers = jsonData
          .map(row => String(row[0] || '').trim())
          .filter(phone => {
            const cleaned = phone.replace(/[^\d+]/g, '');
            return cleaned.length >= 10;
          });

        setContacts(phoneNumbers);
        toast({
          title: "Success",
          description: `Loaded ${phoneNumbers.length} contacts from Excel`
        });
      } else {
        // Parse CSV file
        const text = await file.text();
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        
        const phoneNumbers = lines
          .map(line => {
            const parts = line.split(',');
            return parts[0].trim();
          })
          .filter(phone => {
            const cleaned = phone.replace(/[^\d+]/g, '');
            return cleaned.length >= 10;
          });

        setContacts(phoneNumbers);
        toast({
          title: "Success",
          description: `Loaded ${phoneNumbers.length} contacts from CSV`
        });
      }
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "Error",
        description: "Failed to read file",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle bulk SMS sending
  const handleSendBulkSms = async () => {
    if (contacts.length === 0) {
      toast({
        title: "No contacts",
        description: "Please upload a file with contacts first",
        variant: "destructive"
      });
      return;
    }

    if (!smsMessage.trim()) {
      toast({
        title: "No message",
        description: "Please enter a message to send",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      toast({
        title: "Sending SMS",
        description: `Sending message to ${contacts.length} contacts...`,
      });

      const { data, error } = await supabase.functions.invoke('send-bulk-sms', {
        body: {
          contacts,
          message: smsMessage.trim(),
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to send SMS');

      toast({
        title: "SMS Sent Successfully",
        description: `Sent to ${data.successCount}/${data.totalSent} contacts. Total cost: ${data.totalCost}`,
      });

      setContacts([]);
      setSmsMessage("");
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

  // Handle push notification sending
  const handleSendNotification = async () => {
    if (!notifTitle.trim() || !notifMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter both title and message",
        variant: "destructive"
      });
      return;
    }

    setNotifLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: { title: notifTitle, message: notifMessage, targetPage }
      });

      if (error) throw error;

      toast({
        title: "Notifications Sent",
        description: `Successfully sent to ${data.sent} subscribers`,
      });

      setNotifTitle("");
      setNotifMessage("");
      setTargetPage("/");
    } catch (error: any) {
      console.error('Error sending notifications:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send notifications",
        variant: "destructive"
      });
    } finally {
      setNotifLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            <Package className="h-4 w-4 mr-1" />
            All Orders
          </TabsTrigger>
          <TabsTrigger value="gas" className="text-xs sm:text-sm">
            <Flame className="h-4 w-4 mr-1" />
            Gas
          </TabsTrigger>
          <TabsTrigger value="shop" className="text-xs sm:text-sm">
            <ShoppingBag className="h-4 w-4 mr-1" />
            Shop
          </TabsTrigger>
          <TabsTrigger value="marketing" className="text-xs sm:text-sm">
            <MessageSquare className="h-4 w-4 mr-1" />
            Marketing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <AdminOrdersDashboard 
            userRole="super_admin" 
            userId="" 
            orderType="all"
          />
        </TabsContent>

        <TabsContent value="gas" className="mt-4">
          <AdminOrdersDashboard 
            userRole="super_admin" 
            userId="" 
            orderType="gas"
          />
        </TabsContent>

        <TabsContent value="shop" className="mt-4">
          <AdminOrdersDashboard 
            userRole="super_admin" 
            userId="" 
            orderType="shop"
          />
        </TabsContent>

        <TabsContent value="marketing" className="mt-4 space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Bulk SMS Marketing</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3">
                <div>
                  <label htmlFor="sms-upload" className="block text-sm font-medium mb-1.5">
                    Upload Contacts (CSV or Excel)
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="sms-upload"
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
                    Phone numbers in first column
                  </p>
                </div>

                {contacts.length > 0 && (
                  <div className="bg-accent/20 rounded-lg p-2.5">
                    <p className="text-sm font-medium">
                      {contacts.length} contacts loaded
                    </p>
                  </div>
                )}

                <div>
                  <label htmlFor="sms-text" className="block text-sm font-medium mb-1.5">
                    Message
                  </label>
                  <Textarea
                    id="sms-text"
                    placeholder="Enter your marketing message..."
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    rows={3}
                    className="resize-none text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {smsMessage.length} characters
                  </p>
                </div>

                <Button
                  onClick={handleSendBulkSms}
                  disabled={sending || contacts.length === 0 || !smsMessage.trim()}
                  className="w-full"
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? "Sending..." : `Send to ${contacts.length} Contacts`}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Push Notifications</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="notif-title" className="text-sm">Title</Label>
                  <Input
                    id="notif-title"
                    placeholder="e.g., New Promotion Available"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    maxLength={50}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notif-message" className="text-sm">Message</Label>
                  <Textarea
                    id="notif-message"
                    placeholder="Enter your notification message..."
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    maxLength={200}
                    rows={3}
                    className="text-sm resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {notifMessage.length}/200
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notif-target" className="text-sm">Target Page</Label>
                  <Input
                    id="notif-target"
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
                  onClick={handleSendNotification}
                  disabled={notifLoading || !notifTitle.trim() || !notifMessage.trim()}
                  className="w-full"
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {notifLoading ? "Sending..." : "Send Notification"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
