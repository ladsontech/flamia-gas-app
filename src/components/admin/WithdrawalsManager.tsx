import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, User, Phone, CheckCircle, Clock, X } from "lucide-react";
import { format } from "date-fns";

interface WithdrawalWithProfile {
  id: string;
  amount: number;
  status: string;
  contact: string;
  created_at: string;
  processed_at: string | null;
  admin_note: string | null;
  profiles: {
    display_name: string;
    full_name: string;
    phone_number: string;
  } | null;
}

export const WithdrawalsManager = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<Set<string>>(new Set());
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchWithdrawals();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('withdrawals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'withdrawals'
        },
        () => {
          fetchWithdrawals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('withdrawals')
        .select(`
          id,
          amount,
          status,
          contact,
          created_at,
          processed_at,
          admin_note,
          user_id
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles separately
      const userIds = [...new Set(data?.map(w => w.user_id).filter(Boolean))] as string[];
      let profiles: any[] = [];
      
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, display_name, full_name, phone_number')
          .in('id', userIds);
        
        profiles = profileData || [];
      }

      // Combine data
      const withdrawalsWithProfiles = (data || []).map(withdrawal => ({
        ...withdrawal,
        profiles: profiles.find(p => p.id === withdrawal.user_id) || null
      }));

      setWithdrawals(withdrawalsWithProfiles);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast({
        title: "Error",
        description: "Failed to load withdrawals",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessWithdrawal = async (withdrawalId: string, newStatus: 'completed' | 'rejected') => {
    setProcessing(prev => new Set(prev).add(withdrawalId));
    
    try {
      const { error } = await supabase
        .from('withdrawals')
        .update({
          status: newStatus,
          processed_at: new Date().toISOString(),
          admin_note: adminNotes[withdrawalId] || null
        })
        .eq('id', withdrawalId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Withdrawal ${newStatus} successfully`
      });

      // Clear the admin note
      setAdminNotes(prev => {
        const updated = { ...prev };
        delete updated[withdrawalId];
        return updated;
      });

      fetchWithdrawals();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${newStatus} withdrawal`,
        variant: "destructive"
      });
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(withdrawalId);
        return newSet;
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending', icon: Clock },
      completed: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Completed', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Rejected', icon: X }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.color} border font-medium`}>
        <div className="flex items-center gap-1">
          <IconComponent className="h-3 w-3" />
          {config.label}
        </div>
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading withdrawals...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Withdrawal Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            Total withdrawals: {withdrawals.length} | 
            Pending: {withdrawals.filter(w => w.status === 'pending').length} | 
            Completed: {withdrawals.filter(w => w.status === 'completed').length}
          </div>
        </CardContent>
      </Card>

      {withdrawals.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No withdrawal requests</h3>
            <p className="text-muted-foreground">Withdrawal requests will appear here when users submit them.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {withdrawals.map((withdrawal) => (
            <Card key={withdrawal.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{formatCurrency(withdrawal.amount)}</h3>
                      {getStatusBadge(withdrawal.status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{withdrawal.profiles?.display_name || withdrawal.profiles?.full_name || 'Unknown User'}</span>
                    </div>
                    {withdrawal.contact && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{withdrawal.contact}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Requested: {format(new Date(withdrawal.created_at), 'MMM d, yyyy h:mm a')}</p>
                    {withdrawal.processed_at && (
                      <p>Processed: {format(new Date(withdrawal.processed_at), 'MMM d, yyyy h:mm a')}</p>
                    )}
                  </div>
                </div>

                {withdrawal.admin_note && (
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Admin Note:</p>
                    <p className="text-sm">{withdrawal.admin_note}</p>
                  </div>
                )}

                {withdrawal.status === 'pending' && (
                  <div className="space-y-3 border-t pt-4">
                    <Textarea
                      placeholder="Add a note (optional)"
                      value={adminNotes[withdrawal.id] || ''}
                      onChange={(e) => setAdminNotes(prev => ({
                        ...prev,
                        [withdrawal.id]: e.target.value
                      }))}
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleProcessWithdrawal(withdrawal.id, 'completed')}
                        disabled={processing.has(withdrawal.id)}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        {processing.has(withdrawal.id) ? 'Processing...' : 'Mark as Paid'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleProcessWithdrawal(withdrawal.id, 'rejected')}
                        disabled={processing.has(withdrawal.id)}
                      >
                        {processing.has(withdrawal.id) ? 'Processing...' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};