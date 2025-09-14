import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2, Copy, Users, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { OrderService } from '@/services/orderService';
import { WithdrawalSection } from './WithdrawalSection';

interface CommissionData {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  orders: {
    id: string;
    description: string;
    status: string;
    created_at: string;
  };
  referrals: {
    id: string;
    referral_code: string;
    referred_user_id: string;
  };
}

interface Referral {
  id: string;
  referral_code: string;  
  created_at: string;
  referred_user_id: string | null;
}

export const ReferralManager: React.FC = () => {
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string>('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingEarnings, setPendingEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showReferrals, setShowReferrals] = useState(false);
  const [showPendingDetails, setShowPendingDetails] = useState(false);
  const [referredUsers, setReferredUsers] = useState<Array<{name: string, email: string}>>([]);

  useEffect(() => {
    fetchReferralData();
    
    // Set up real-time subscription for commission updates
    const channel = supabase
      .channel('commission-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'commissions'
        },
        () => {
          console.log('Commission update detected, refetching data...');
          fetchReferralData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          console.log('Order update detected, refetching data...');
          fetchReferralData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReferralData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's referral code from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .single();

      if (profile?.referral_code) {
        setReferralCode(profile.referral_code);
      }

      // Fetch referrals made by this user
      const { data: referralsData } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      setReferrals(referralsData || []);

      // Fetch commission data using the OrderService
      const commissionData = await OrderService.getReferralCommissions(user.id);
      
      setCommissions(commissionData.commissions);
      
      // Get available earnings (after deducting withdrawals)
      const availableEarnings = await OrderService.getAvailableEarnings(user.id);
      setTotalEarnings(availableEarnings);
      setPendingEarnings(commissionData.pendingEarnings);

      console.log('Commission data:', commissionData);
      console.log('Available earnings after withdrawals:', availableEarnings);
      console.log('Total commissions found:', commissionData.commissions.length);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',  
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const pendingCommissions = commissions.filter(c => c.status === 'pending' || c.orders.status !== 'completed');

  const generateReferralCode = async () => {
    try {
      setGenerating(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Call the database function to generate a unique code
      const { data, error } = await supabase.rpc('generate_referral_code', {
        user_id: user.id
      });

      if (error) throw error;

      const newCode = data;

      // Update user's profile with the new referral code
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ referral_code: newCode })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setReferralCode(newCode);
      toast({
        title: "Referral code generated!",
        description: "Your unique referral code has been created."
      });
    } catch (error: any) {
      toast({
        title: "Error generating code",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link copied!",
      description: "Referral link has been copied to clipboard."
    });
  };

  const shareReferralLink = () => {
    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
    const shareText = `Join Flamia Gas Delivery with my referral link and get fast gas delivery! ${referralLink}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join Flamia Gas Delivery',
        text: shareText,
        url: referralLink
      });
    } else {
      copyReferralLink();
    }
  };

  const fetchReferredUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get referred users' profiles by joining the tables manually
      const { data: referralsData } = await supabase
        .from('referrals')
        .select('referred_user_id')
        .eq('referrer_id', user.id);

      if (referralsData && referralsData.length > 0) {
        const userIds = referralsData.map(ref => ref.referred_user_id).filter(Boolean);
        
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, display_name, full_name')
            .in('id', userIds);

          if (profilesData) {
            const users = profilesData.map(profile => ({
              name: profile.display_name || profile.full_name || 'Unknown User',
              email: profile.id || ''
            }));
            setReferredUsers(users);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching referred users:', error);
    }
  };

  const toggleReferrals = async () => {
    if (!showReferrals && referredUsers.length === 0) {
      await fetchReferredUsers();
    }
    setShowReferrals(!showReferrals);
  };

  const parseOrderDescription = (description: string) => {
    const desc = description.toLowerCase();
    
    // Extract brand name
    let brand = 'Unknown';
    if (desc.includes('nova')) brand = 'Nova';
    else if (desc.includes('shell')) brand = 'Shell';
    else if (desc.includes('total')) brand = 'Total';
    else if (desc.includes('hass')) brand = 'Hass';
    else if (desc.includes('oryx')) brand = 'Oryx';
    else if (desc.includes('stabex')) brand = 'Stabex';
    else if (desc.includes('ultimate')) brand = 'Ultimate';
    
    // Extract type (full/refill)
    let type = 'Unknown';
    if (desc.includes('refill')) type = 'Refill';
    else if (desc.includes('full') || desc.includes('kit')) type = 'Full Kit';
    else type = 'Gas';
    
    // Extract weight
    let weight = 'Unknown';
    if (desc.includes('12kg') || desc.includes('12 kg')) weight = '12kg';
    else if (desc.includes('6kg') || desc.includes('6 kg')) weight = '6kg';
    else if (desc.includes('3kg') || desc.includes('3 kg')) weight = '3kg';
    else if (desc.includes('45kg') || desc.includes('45 kg')) weight = '45kg';
    
    return { brand, type, weight };
  };

  const togglePendingDetails = () => {
    setShowPendingDetails(!showPendingDetails);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Users className="w-5 h-5" />
          <span>Referrals & Commissions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 space-y-6">
        {/* Referral Code Section */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm">Your Referral Code</h3>
          {!referralCode ? (
            <div className="text-center py-4">
              <p className="text-gray-600 text-sm mb-3">Generate your unique referral code to start earning commissions</p>
              <Button onClick={generateReferralCode} disabled={generating} size="sm">
                {generating ? "Generating..." : "Generate Referral Code"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Input 
                  value={`${window.location.origin}/signup?ref=${referralCode}`}
                  readOnly
                  className="text-xs"
                />
                <Button size="sm" variant="outline" onClick={copyReferralLink}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={shareReferralLink}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="text-xs">
                  Code: {referralCode}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {referralCode && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div 
                className="bg-blue-50 p-3 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={toggleReferrals}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-900">Total Referrals</span>
                </div>
                <p className="text-lg font-bold text-blue-900 mt-1">{referrals.length}</p>
                {referrals.length > 0 && (
                  <p className="text-xs text-blue-600 mt-1">Click to view details</p>
                )}
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-900">Completed Earnings</span>
                </div>
                <p className="text-lg font-bold text-green-900 mt-1">{formatCurrency(totalEarnings)}</p>
              </div>
              
              <div 
                className="bg-yellow-50 p-3 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
                onClick={togglePendingDetails}
              >
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-900">Pending Earnings</span>
                </div>
                <p className="text-lg font-bold text-yellow-900 mt-1">{formatCurrency(pendingEarnings)}</p>
                {pendingCommissions.length > 0 && (
                  <p className="text-xs text-yellow-600 mt-1">Click to view details</p>
                )}
              </div>
            </div>

            {/* Referred Users List */}
            {showReferrals && referrals.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-sm">Referred Users</h3>
                <div className="space-y-2">
                  {referredUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">Referred User</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Earnings Details */}
            {showPendingDetails && pendingCommissions.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-sm">Pending Earnings Details</h3>
                <div className="space-y-2">
                  {pendingCommissions.map((commission) => {
                    const orderDetails = parseOrderDescription(commission.orders.description);
                    return (
                      <div key={commission.id} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{orderDetails.brand} - {orderDetails.weight}</p>
                            <p className="text-xs text-gray-600">{orderDetails.type}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(commission.orders.created_at), 'dd/MM/yy')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{formatCurrency(Number(commission.amount))}</p>
                          <Badge 
                            variant={commission.orders.status === 'assigned' ? 'secondary' : 'outline'}
                            className="text-xs mt-1"
                          >
                            {commission.orders.status === 'assigned' ? 'Assigned' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Show WithdrawalSection if there are completed earnings */}
            {totalEarnings > 0 && (
              <WithdrawalSection completedEarnings={totalEarnings} />
            )}

            {/* Pending Payments Section */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Pending Payments</h3>
              {pendingCommissions.length === 0 ? (
                <div className="text-center py-6">
                  <DollarSign className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600 text-sm">No pending payments</p>
                  <p className="text-gray-500 text-xs mt-1">Orders from your referrals will show here until completed!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingCommissions.map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          commission.orders.status === 'assigned' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-sm">{formatCurrency(Number(commission.amount))}</p>
                          <p className="text-xs text-gray-500">
                            {commission.orders.description.length > 30 
                              ? `${commission.orders.description.substring(0, 30)}...` 
                              : commission.orders.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={commission.orders.status === 'assigned' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {commission.orders.status === 'assigned' ? 'Assigned' : 'Pending'}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(commission.orders.created_at), 'dd/MM/yy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Commission History */}
            {commissions.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-sm">Commission History</h3>
                <div className="space-y-2">
                  {commissions.map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          commission.orders.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-sm">{formatCurrency(Number(commission.amount))}</p>
                          <p className="text-xs text-gray-500">
                            {commission.orders.description.length > 30 
                              ? `${commission.orders.description.substring(0, 30)}...` 
                              : commission.orders.description}
                          </p>
                          <p className="text-xs text-gray-400">
                            Code: {commission.referrals.referral_code}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={commission.orders.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {commission.orders.status === 'completed' ? 'Completed' : commission.orders.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(commission.orders.created_at), 'dd/MM/yy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};