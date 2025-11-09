import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, User, Phone, CheckCircle, Clock, X, TrendingUp, AlertCircle, Shield } from "lucide-react";
import { format } from "date-fns";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useUserRole } from "@/hooks/useUserRole";

interface CommissionWithDetails {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  approved_at: string | null;
  order_id: string;
  referral: {
    referrer_id: string;
  } | null;
  referrer_profile: {
    display_name: string;
    full_name: string;
    phone_number: string;
  } | null;
}

interface WithdrawalWithProfile {
  id: string;
  amount: number;
  status: string;
  contact: string;
  created_at: string;
  processed_at: string | null;
  admin_note: string | null;
  user_id: string;
  profiles: {
    display_name: string;
    full_name: string;
    phone_number: string;
  } | null;
}

export const CommissionsWithdrawalsManager = () => {
  const [commissions, setCommissions] = useState<CommissionWithDetails[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<Set<string>>(new Set());
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { isAdmin } = useUserRole();
  const { canManageCommissions, loading: permissionsLoading } = useAdminPermissions();

  // Check if user has permission to view this component
  if (!loading && !permissionsLoading && !isAdmin && !canManageCommissions) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground">
                You don't have permission to manage commissions and withdrawals.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    fetchData();
    
    // Set up real-time subscriptions
    const commissionsChannel = supabase
      .channel('commissions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commissions' }, () => {
        fetchData();
      })
      .subscribe();

    const withdrawalsChannel = supabase
      .channel('withdrawals-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(commissionsChannel);
      supabase.removeChannel(withdrawalsChannel);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch commissions
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('commissions')
        .select(`
          id,
          amount,
          status,
          created_at,
          approved_at,
          order_id,
          referral_id
        `)
        .order('created_at', { ascending: false });

      if (commissionsError) throw commissionsError;

      // Get referral details for commissions
      const referralIds = [...new Set(commissionsData?.map(c => c.referral_id).filter(Boolean))] as string[];
      let referralData: any[] = [];
      
      if (referralIds.length > 0) {
        const { data: refData } = await supabase
          .from('referrals')
          .select('id, referrer_id')
          .in('id', referralIds);
        
        referralData = refData || [];
      }

      // Get referrer profiles
      const referrerIds = [...new Set(referralData.map(r => r.referrer_id).filter(Boolean))] as string[];
      let referrerProfiles: any[] = [];
      
      if (referrerIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, display_name, full_name, phone_number')
          .in('id', referrerIds);
        
        referrerProfiles = profileData || [];
      }

      // Combine commissions with referral and profile data
      const commissionsWithDetails = (commissionsData || []).map(commission => {
        const referral = referralData.find(r => r.id === commission.referral_id);
        const profile = referral ? referrerProfiles.find(p => p.id === referral.referrer_id) : null;
        
        return {
          ...commission,
          referral: referral || null,
          referrer_profile: profile || null
        };
      });

      setCommissions(commissionsWithDetails);

      // Fetch withdrawals
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (withdrawalsError) throw withdrawalsError;

      // Fetch user profiles for withdrawals
      const userIds = [...new Set(withdrawalsData?.map(w => w.user_id).filter(Boolean))] as string[];
      let userProfiles: any[] = [];
      
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, display_name, full_name, phone_number')
          .in('id', userIds);
        
        userProfiles = profileData || [];
      }

      // Combine withdrawals with profile data
      const withdrawalsWithProfiles = (withdrawalsData || []).map(withdrawal => ({
        ...withdrawal,
        profiles: userProfiles.find(p => p.id === withdrawal.user_id) || null
      }));

      setWithdrawals(withdrawalsWithProfiles);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
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

      setAdminNotes(prev => {
        const updated = { ...prev };
        delete updated[withdrawalId];
        return updated;
      });

      fetchData();
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
      approved: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Approved', icon: CheckCircle },
      completed: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Completed', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Rejected', icon: X },
      cancelled: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Cancelled', icon: X }
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

  // Calculate totals
  const totalCommissions = commissions.reduce((sum, c) => sum + Number(c.amount), 0);
  const pendingCommissions = commissions.filter(c => c.status === 'pending');
  const approvedCommissions = commissions.filter(c => c.status === 'approved');
  const totalPendingCommissions = pendingCommissions.reduce((sum, c) => sum + Number(c.amount), 0);
  const totalApprovedCommissions = approvedCommissions.reduce((sum, c) => sum + Number(c.amount), 0);

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const completedWithdrawals = withdrawals.filter(w => w.status === 'completed');
  const totalPendingWithdrawals = pendingWithdrawals.reduce((sum, w) => sum + Number(w.amount), 0);
  const totalCompletedWithdrawals = completedWithdrawals.reduce((sum, w) => sum + Number(w.amount), 0);

  // Loading is now handled by parent Account page
  if (loading || permissionsLoading) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Commissions</p>
                <p className="text-lg font-bold">{formatCurrency(totalCommissions)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending Commissions</p>
                <p className="text-lg font-bold text-yellow-600">{formatCurrency(totalPendingCommissions)}</p>
                <p className="text-xs text-muted-foreground">{pendingCommissions.length} items</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending Withdrawals</p>
                <p className="text-lg font-bold text-orange-600">{formatCurrency(totalPendingWithdrawals)}</p>
                <p className="text-xs text-muted-foreground">{pendingWithdrawals.length} requests</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Completed Withdrawals</p>
                <p className="text-lg font-bold text-orange-600">{formatCurrency(totalCompletedWithdrawals)}</p>
                <p className="text-xs text-muted-foreground">{completedWithdrawals.length} paid</p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="commissions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="commissions">
            Commissions ({commissions.length})
          </TabsTrigger>
          <TabsTrigger value="pending-withdrawals">
            Pending ({pendingWithdrawals.length})
          </TabsTrigger>
          <TabsTrigger value="completed-withdrawals">
            Completed ({completedWithdrawals.length})
          </TabsTrigger>
        </TabsList>

        {/* Commissions Tab */}
        <TabsContent value="commissions" className="space-y-4">
          {commissions.length === 0 ? (
            <Card className="p-8">
              <div className="text-center">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No commissions yet</h3>
                <p className="text-muted-foreground">Commissions will appear here when orders are completed.</p>
              </div>
            </Card>
          ) : (
            commissions.map((commission) => (
              <Card key={commission.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{formatCurrency(commission.amount)}</h3>
                        {getStatusBadge(commission.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>
                          {commission.referrer_profile?.display_name || 
                           commission.referrer_profile?.full_name || 
                           'Unknown Referrer'}
                        </span>
                      </div>
                      {commission.referrer_profile?.phone_number && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{commission.referrer_profile.phone_number}</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Order ID: {commission.order_id.substring(0, 8)}...
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{format(new Date(commission.created_at), 'MMM d, yyyy')}</p>
                      <p className="text-xs">{format(new Date(commission.created_at), 'h:mm a')}</p>
                      {commission.approved_at && (
                        <p className="text-xs text-orange-600 mt-1">
                          Approved: {format(new Date(commission.approved_at), 'MMM d')}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Pending Withdrawals Tab */}
        <TabsContent value="pending-withdrawals" className="space-y-4">
          {pendingWithdrawals.length === 0 ? (
            <Card className="p-8">
              <div className="text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending withdrawals</h3>
                <p className="text-muted-foreground">Withdrawal requests will appear here.</p>
              </div>
            </Card>
          ) : (
            pendingWithdrawals.map((withdrawal) => (
              <Card key={withdrawal.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{formatCurrency(withdrawal.amount)}</h3>
                        {getStatusBadge(withdrawal.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>
                          {withdrawal.profiles?.display_name || 
                           withdrawal.profiles?.full_name || 
                           'Unknown User'}
                        </span>
                      </div>
                      {withdrawal.contact && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{withdrawal.contact}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{format(new Date(withdrawal.created_at), 'MMM d, yyyy')}</p>
                      <p className="text-xs">{format(new Date(withdrawal.created_at), 'h:mm a')}</p>
                    </div>
                  </div>

                  <div className="space-y-3 border-t pt-4">
                    <Textarea
                      placeholder="Add a note (optional)"
                      value={adminNotes[withdrawal.id] || ''}
                      onChange={(e) => setAdminNotes(prev => ({
                        ...prev,
                        [withdrawal.id]: e.target.value
                      }))}
                      className="min-h-[60px] text-sm"
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
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Completed Withdrawals Tab */}
        <TabsContent value="completed-withdrawals" className="space-y-4">
          {completedWithdrawals.length === 0 ? (
            <Card className="p-8">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No completed withdrawals</h3>
                <p className="text-muted-foreground">Completed withdrawals will appear here.</p>
              </div>
            </Card>
          ) : (
            completedWithdrawals.map((withdrawal) => (
              <Card key={withdrawal.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{formatCurrency(withdrawal.amount)}</h3>
                        {getStatusBadge(withdrawal.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>
                          {withdrawal.profiles?.display_name || 
                           withdrawal.profiles?.full_name || 
                           'Unknown User'}
                        </span>
                      </div>
                      {withdrawal.contact && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{withdrawal.contact}</span>
                        </div>
                      )}
                      {withdrawal.admin_note && (
                        <div className="mt-2 p-2 bg-muted rounded text-xs">
                          <p className="font-medium mb-1">Admin Note:</p>
                          <p>{withdrawal.admin_note}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{format(new Date(withdrawal.created_at), 'MMM d, yyyy')}</p>
                      {withdrawal.processed_at && (
                        <p className="text-xs text-orange-600 mt-1">
                          Paid: {format(new Date(withdrawal.processed_at), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
