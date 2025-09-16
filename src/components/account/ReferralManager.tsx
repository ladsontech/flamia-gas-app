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
  const {
    toast
  } = useToast();
  const [referralCode, setReferralCode] = useState<string>('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingEarnings, setPendingEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showReferrals, setShowReferrals] = useState(false);
  const [showPendingDetails, setShowPendingDetails] = useState(false);
  const [referredUsers, setReferredUsers] = useState<Array<{
    name: string;
    email: string;
  }>>([]);
  useEffect(() => {
    fetchReferralData();

    // Set up real-time subscription for commission updates
    const channel = supabase.channel('commission-updates').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'commissions'
    }, () => {
      console.log('Commission update detected, refetching data...');
      fetchReferralData();
    }).on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'orders'
    }, () => {
      console.log('Order update detected, refetching data...');
      fetchReferralData();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const fetchReferralData = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's referral code from profiles
      const {
        data: profile
      } = await supabase.from('profiles').select('referral_code').eq('id', user.id).single();
      if (profile?.referral_code) {
        setReferralCode(profile.referral_code);
      }

      // Fetch referrals made by this user
      const {
        data: referralsData
      } = await supabase.from('referrals').select('*').eq('referrer_id', user.id).order('created_at', {
        ascending: false
      });
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
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;

      // Call the database function to generate a unique code
      const {
        data,
        error
      } = await supabase.rpc('generate_referral_code', {
        user_id: user.id
      });
      if (error) throw error;
      const newCode = data;

      // Update user's profile with the new referral code
      const {
        error: updateError
      } = await supabase.from('profiles').update({
        referral_code: newCode
      }).eq('id', user.id);
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
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get referred users' profiles by joining the tables manually
      const {
        data: referralsData
      } = await supabase.from('referrals').select('referred_user_id').eq('referrer_id', user.id);
      if (referralsData && referralsData.length > 0) {
        const userIds = referralsData.map(ref => ref.referred_user_id).filter(Boolean);
        if (userIds.length > 0) {
          const {
            data: profilesData
          } = await supabase.from('profiles').select('id, display_name, full_name').in('id', userIds);
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

    // Extract brand name with more flexible matching
    let brand = 'Gas';
    const brandPatterns = [{
      pattern: /c\s*[-_]?\s*gas|cgas/i,
      name: 'C Gas'
    }, {
      pattern: /nova/i,
      name: 'Nova'
    }, {
      pattern: /shell/i,
      name: 'Shell'
    }, {
      pattern: /total\s*energies|totalenergies|total/i,
      name: 'Total'
    }, {
      pattern: /hass/i,
      name: 'Hass'
    }, {
      pattern: /oryx/i,
      name: 'Oryx'
    }, {
      pattern: /stabex/i,
      name: 'Stabex'
    }, {
      pattern: /ultimate/i,
      name: 'Ultimate'
    }];
    for (const {
      pattern,
      name
    } of brandPatterns) {
      if (pattern.test(description)) {
        brand = name;
        break;
      }
    }

    // Extract type (full/refill)
    let type = 'Gas';
    if (desc.includes('refill')) type = 'Refill';else if (desc.includes('full') || desc.includes('kit')) type = 'Full Kit';

    // Extract weight with more patterns
    let weight = '';
    const weightPatterns = [{
      pattern: /(\d+)\s*kg/i,
      extract: true
    }, {
      pattern: /45\s*kg/i,
      value: '45kg'
    }, {
      pattern: /12\s*kg/i,
      value: '12kg'
    }, {
      pattern: /6\s*kg/i,
      value: '6kg'
    }, {
      pattern: /3\s*kg/i,
      value: '3kg'
    }];
    for (const {
      pattern,
      value,
      extract
    } of weightPatterns) {
      const match = description.match(pattern);
      if (match) {
        weight = extract ? `${match[1]}kg` : value;
        break;
      }
    }
    return {
      brand,
      type,
      weight
    };
  };
  const togglePendingDetails = () => {
    setShowPendingDetails(!showPendingDetails);
  };
  if (loading) {
    return <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>;
  }
  return <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl">Referrals & Earnings</CardTitle>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-lg p-4 mt-2">
          <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-3">💰 How Referral Earnings Work!</h3>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-orange-200 dark:bg-orange-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-orange-800 dark:text-orange-200">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Share Your Referral Code</p>
                <p className="text-xs text-orange-700 dark:text-orange-300">Friends sign up using your unique referral link</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-orange-200 dark:bg-orange-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-orange-800 dark:text-orange-200">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Friends Place Orders</p>
                <p className="text-xs text-orange-700 dark:text-orange-300">Each order creates a commission (status: pending)</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-green-800 dark:text-green-200">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Orders Get Completed</p>
                <p className="text-xs text-orange-700 dark:text-orange-300">Only completed orders become available for withdrawal</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
            <p className="text-sm font-bold text-orange-900 dark:text-orange-100 mb-1">💵 Commission Rates:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-orange-700 dark:text-orange-300">Each order from a referral creates a commission</span>
                <span className="font-semibold text-orange-800 dark:text-orange-200">UGX 3,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-700 dark:text-orange-300">6kg Gas:</span>
                <span className="font-semibold text-orange-800 dark:text-orange-200">UGX 5,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-700 dark:text-orange-300">12kg Gas:</span>
                <span className="font-semibold text-orange-800 dark:text-orange-200">UGX 10,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-700 dark:text-orange-300">Full Kits:</span>
                <span className="font-semibold text-orange-800 dark:text-orange-200">UGX 10,000</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
            <p className="text-xs text-orange-700 dark:text-orange-300">
              <span className="font-semibold">Important:</span> Earnings are only approved when orders are successfully completed. Cancelled orders won't generate commissions.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 space-y-4 sm:space-y-6">
        {/* Referral Code Section */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm sm:text-base">Your Referral Code</h3>
          {!referralCode ? <div className="text-center py-4">
              <p className="text-gray-600 text-sm mb-3">Generate your unique referral code to start earning commissions</p>
              <Button onClick={generateReferralCode} disabled={generating} size="sm" className="w-full sm:w-auto">
                {generating ? "Generating..." : "Generate Referral Code"}
              </Button>
            </div> : <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <Input value={`${window.location.origin}/signup?ref=${referralCode}`} readOnly className="text-xs flex-1" />
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={copyReferralLink} className="flex-1 sm:flex-none">
                    <Copy className="w-4 h-4 mr-1 sm:mr-0" />
                    <span className="sm:hidden">Copy</span>
                  </Button>
                  <Button size="sm" onClick={shareReferralLink} className="flex-1 sm:flex-none">
                    <Share2 className="w-4 h-4 mr-1 sm:mr-0" />
                    <span className="sm:hidden">Share</span>
                  </Button>
                </div>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="text-xs">
                  Code: {referralCode}
                </Badge>
              </div>
            </div>}
        </div>

        {referralCode && <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-primary/10 p-3 sm:p-4 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors" onClick={toggleReferrals}>
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-xs sm:text-sm font-medium text-foreground">Total Referrals</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{referrals.length}</p>
                {referrals.length > 0 && <p className="text-xs text-muted-foreground mt-1">Tap to view details</p>}
              </div>
              
              <div className="bg-primary/10 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-xs sm:text-sm font-medium text-foreground">Available Earnings</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{formatCurrency(totalEarnings)}</p>
                <p className="text-xs text-muted-foreground mt-1">Ready to withdraw</p>
              </div>
              
              <div className="bg-primary/10 p-3 sm:p-4 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors" onClick={togglePendingDetails}>
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-xs sm:text-sm font-medium text-foreground">Pending Earnings</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{formatCurrency(pendingEarnings)}</p>
                {pendingCommissions.length > 0 && <p className="text-xs text-yellow-600 mt-1">Tap to view details</p>}
              </div>
            </div>

            {/* Referred Users List */}
            {showReferrals && referrals.length > 0 && <div className="space-y-3">
                <h3 className="font-medium text-sm">Referred Users</h3>
                <div className="space-y-2">
                  {referredUsers.map((user, index) => <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
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
                    </div>)}
                </div>
              </div>}

            {/* Pending Earnings Details */}
            {showPendingDetails && pendingCommissions.length > 0 && <div className="space-y-3">
                <h3 className="font-medium text-sm">Pending Earnings Details</h3>
                <div className="space-y-2">
                  {pendingCommissions.map(commission => {
              const orderDetails = parseOrderDescription(commission.orders.description);
              return <div key={commission.id} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-yellow-600" />
                          </div>
                          <div>
                           <p className="font-medium text-sm">{orderDetails.brand} {orderDetails.weight && `- ${orderDetails.weight}`}</p>
                           <p className="text-xs text-gray-600">{orderDetails.type}</p>
                           <p className="text-xs text-gray-500">
                             {format(new Date(commission.orders.created_at), 'dd/MM/yy')}
                           </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{formatCurrency(Number(commission.amount))}</p>
                          <Badge variant={commission.orders.status === 'assigned' ? 'secondary' : 'outline'} className="text-xs mt-1">
                            {commission.orders.status === 'assigned' ? 'Assigned' : 'Pending'}
                          </Badge>
                        </div>
                      </div>;
            })}
                </div>
              </div>}

            {/* Show WithdrawalSection if there are completed earnings */}
            {totalEarnings > 0 && <WithdrawalSection completedEarnings={totalEarnings} />}

            {/* Pending Payments Section */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Pending Payments</h3>
              {pendingCommissions.length === 0 ? <div className="text-center py-6">
                  <DollarSign className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600 text-sm">No pending payments</p>
                  <p className="text-gray-500 text-xs mt-1">Orders from your referrals will show here until completed!</p>
                </div> : <div className="space-y-2">
                  {pendingCommissions.map(commission => <div key={commission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${commission.orders.status === 'assigned' ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>
                        <div>
                          <p className="font-medium text-sm">{formatCurrency(Number(commission.amount))}</p>
                          <p className="text-xs text-gray-500">
                            {commission.orders.description.length > 30 ? `${commission.orders.description.substring(0, 30)}...` : commission.orders.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={commission.orders.status === 'assigned' ? 'secondary' : 'outline'} className="text-xs">
                          {commission.orders.status === 'assigned' ? 'Assigned' : 'Pending'}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(commission.orders.created_at), 'dd/MM/yy')}
                        </p>
                      </div>
                    </div>)}
                </div>}
            </div>

            {/* Commission History */}
            {commissions.length > 0 && <div className="space-y-3">
                <h3 className="font-medium text-sm">Commission History</h3>
                <div className="space-y-2">
                  {commissions.map(commission => <div key={commission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${commission.orders.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <div>
                          <p className="font-medium text-sm">{formatCurrency(Number(commission.amount))}</p>
                          <p className="text-xs text-gray-500">
                            {commission.orders.description.length > 30 ? `${commission.orders.description.substring(0, 30)}...` : commission.orders.description}
                          </p>
                          <p className="text-xs text-gray-400">
                            Referred User
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={commission.orders.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                          {commission.orders.status === 'completed' ? 'Completed' : commission.orders.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(commission.orders.created_at), 'dd/MM/yy')}
                        </p>
                      </div>
                    </div>)}
                </div>
              </div>}
          </>}
      </CardContent>
    </Card>;
};