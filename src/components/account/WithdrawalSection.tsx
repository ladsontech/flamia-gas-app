import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Phone, Clock, CheckCircle, X } from "lucide-react";
import { format } from "date-fns";

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  contact: string;
  created_at: string;
  processed_at: string | null;
  admin_note: string | null;
}

interface WithdrawalSectionProps {
  completedEarnings: number;
}

export const WithdrawalSection = ({ completedEarnings }: WithdrawalSectionProps) => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchWithdrawals();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('user-withdrawals')
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(withdrawalAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive"
      });
      return;
    }

    if (amount > completedEarnings) {
      toast({
        title: "Insufficient funds",
        description: "You cannot withdraw more than your available earnings",
        variant: "destructive"
      });
      return;
    }

    if (!contactNumber.trim()) {
      toast({
        title: "Contact required",
        description: "Please enter your contact number for payment",
        variant: "destructive"
      });
      return;
    }

    setIsWithdrawing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          amount,
          contact: contactNumber.trim(),
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Withdrawal requested",
        description: "Your withdrawal request has been submitted. Admin will process it shortly."
      });

      // Reset form
      setWithdrawalAmount('');
      setContactNumber('');
      
      fetchWithdrawals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit withdrawal request",
        variant: "destructive"
      });
    } finally {
      setIsWithdrawing(false);
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
      completed: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Completed', icon: CheckCircle },
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

  const totalWithdrawn = withdrawals
    .filter(w => w.status === 'completed')
    .reduce((sum, w) => sum + w.amount, 0);

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Withdrawal Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Request Withdrawal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleWithdrawal} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (UGX)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  max={completedEarnings}
                  min="1000"
                  step="1000"
                />
                <p className="text-xs text-muted-foreground">
                  Available: {formatCurrency(completedEarnings)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  type="tel"
                  placeholder="Mobile Money number"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Payment will be sent to this number
                </p>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isWithdrawing || pendingWithdrawals.length > 0}
              className="w-full"
            >
              {isWithdrawing ? 'Processing...' : 'Request Withdrawal'}
            </Button>

            {pendingWithdrawals.length > 0 && (
              <p className="text-sm text-orange-600 text-center">
                You have pending withdrawal requests. Wait for them to be processed before making new requests.
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      {withdrawals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Withdrawal History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Total withdrawn: {formatCurrency(totalWithdrawn)}
              </div>
              
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(withdrawal.amount)}</span>
                      {getStatusBadge(withdrawal.status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{withdrawal.contact}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Requested: {format(new Date(withdrawal.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                    {withdrawal.processed_at && (
                      <p className="text-xs text-muted-foreground">
                        Processed: {format(new Date(withdrawal.processed_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    )}
                    {withdrawal.admin_note && (
                      <p className="text-xs text-red-600">
                        Note: {withdrawal.admin_note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};