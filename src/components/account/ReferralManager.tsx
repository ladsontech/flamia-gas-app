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

interface RefereeOrder {
  id: string;
  description: string;
  status: 'pending' | 'assigned' | 'completed';
  created_at: string;
  commission_amount: number;
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
  const [refereeOrders, setRefereeOrders] = useState<RefereeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchReferralData();
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

      // Fetch orders made by referred users with commission calculation
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          id,
          description,
          status,
          created_at,
          referrals!inner(referrer_id)
        `)
        .eq('referrals.referrer_id', user.id)
        .order('created_at', { ascending: false });

      // Calculate commission for each order
      const ordersWithCommission = (ordersData || []).map(order => ({
        id: order.id,
        description: order.description,
        status: order.status as 'pending' | 'assigned' | 'completed',
        created_at: order.created_at,
        commission_amount: calculateCommission(order.description)
      }));

      setRefereeOrders(ordersWithCommission);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCommission = (description: string): number => {
    if (description.toLowerCase().includes('full kit') || description.toLowerCase().includes('kit')) {
      return 10000; // Full kits: UGX 10,000
    } else if (description.toLowerCase().includes('12kg') || description.toLowerCase().includes('12 kg')) {
      return 10000; // 12kg cylinder: UGX 10,000
    } else if (description.toLowerCase().includes('6kg') || description.toLowerCase().includes('6 kg')) {
      return 5000; // 6kg cylinder: UGX 5,000
    } else if (description.toLowerCase().includes('3kg') || description.toLowerCase().includes('3 kg')) {
      return 3000; // 3kg cylinder: UGX 3,000
    }
    return 0;
  };

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalEarnings = refereeOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.commission_amount, 0);

  const pendingPayments = refereeOrders
    .filter(o => o.status === 'pending' || o.status === 'assigned');

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
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-900">Total Referrals</span>
                </div>
                <p className="text-lg font-bold text-blue-900 mt-1">{referrals.length}</p>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-900">Total Earnings</span>
                </div>
                <p className="text-lg font-bold text-green-900 mt-1">{formatCurrency(totalEarnings)}</p>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-900">Pending Payments</span>
                </div>
                <p className="text-lg font-bold text-yellow-900 mt-1">{pendingPayments.length}</p>
              </div>
            </div>

            {/* Pending Payments Section */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Pending Payments</h3>
              {pendingPayments.length === 0 ? (
                <div className="text-center py-6">
                  <DollarSign className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600 text-sm">No pending payments</p>
                  <p className="text-gray-500 text-xs mt-1">Orders from your referrals will show here until completed!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingPayments.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          order.status === 'assigned' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-sm">{formatCurrency(order.commission_amount)}</p>
                          <p className="text-xs text-gray-500">
                            {order.description.length > 30 
                              ? `${order.description.substring(0, 30)}...` 
                              : order.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={order.status === 'assigned' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {order.status === 'assigned' ? 'Assigned' : 'Pending'}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(order.created_at), 'dd/MM/yy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};