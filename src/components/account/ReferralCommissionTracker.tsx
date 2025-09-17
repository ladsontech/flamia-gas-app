import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { OrderService } from "@/services/orderService";
import { Copy, Share2, DollarSign, Clock, CheckCircle, Users } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { WithdrawalSection } from "./WithdrawalSection";
import { ReferralAdvert } from "../referral/ReferralAdvert";

interface ReferralData {
  id: string;
  referral_code: string;
  created_at: string;
  referred_user_id: string;
}

interface CommissionData {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  approved_at: string | null;
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

export const ReferralCommissionTracker = () => {
  const [referralCode, setReferralCode] = useState<string>("");
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReferralData();
    
    // Set up real-time subscription for commissions
    const channel = supabase
      .channel('referral-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'commissions'
        },
        () => {
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
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Get user's referral code
      const { data: profileData } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .single();

      if (profileData?.referral_code) {
        setReferralCode(profileData.referral_code);
      }

      // Get user's referrals
      const { data: referralsData } = await supabase
        .from('referrals')
        .select('id, referral_code, created_at, referred_user_id')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      setReferrals(referralsData || []);

      // Get commission data
      const commissionData = await OrderService.getReferralCommissions(user.id);
      setCommissions(commissionData.commissions);

    } catch (error) {
      console.error('Error fetching referral data:', error);
      toast({
        title: "Error",
        description: "Failed to load referral data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = async () => {
    try {
      setGenerating(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase.rpc('generate_referral_code', {
        user_id: user.id
      });

      if (error) throw error;

      // Update user's profile with the new referral code
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ referral_code: data })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setReferralCode(data);
      toast({
        title: "Referral code generated",
        description: `Your referral code is: ${data}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate referral code",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyReferralLink = async () => {
    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy referral link",
        variant: "destructive"
      });
    }
  };

  const shareReferralLink = async () => {
    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Flamia Gas',
          text: `Use my referral code ${referralCode} to get started with Flamia Gas!`,
          url: referralLink
        });
      } catch (error) {
        copyReferralLink();
      }
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

  const pendingCommissions = commissions.filter(c => c.status === 'pending' || c.orders.status !== 'completed');
  const completedCommissions = commissions.filter(c => c.status === 'approved' && c.orders.status === 'completed');
  const pendingEarnings = pendingCommissions.reduce((sum, c) => sum + c.amount, 0);
  
  // Calculate available earnings (completed commissions minus withdrawals)
  const [availableEarnings, setAvailableEarnings] = useState(0);
  
  useEffect(() => {
    const calculateAvailable = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const available = await OrderService.getAvailableEarnings(user.id);
      setAvailableEarnings(available);
    };
    
    if (commissions.length > 0) {
      calculateAvailable();
    }
  }, [commissions]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading referral data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral Code Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {referralCode ? (
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Your referral code:</p>
                <p className="text-lg font-mono font-bold">{referralCode}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={copyReferralLink} variant="outline" className="flex-1">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button onClick={shareReferralLink} className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <p className="text-muted-foreground">Generate your referral code to start earning commissions!</p>
              <Button onClick={generateReferralCode} disabled={generating}>
                {generating ? "Generating..." : "Generate Referral Code"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flamia Promotional Poster */}
      {referralCode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Print & Share Flamia Poster
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReferralAdvert 
              referralCode={referralCode}
              referralLink={`${window.location.origin}/signup?ref=${referralCode}`}
            />
          </CardContent>
        </Card>
      )}

      {/* Commission Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold">{referrals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Available to Withdraw</p>
                <p className="text-2xl font-bold">{formatCurrency(availableEarnings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Earnings</p>
                <p className="text-2xl font-bold">{formatCurrency(pendingEarnings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Section */}
      {availableEarnings > 0 && <WithdrawalSection completedEarnings={availableEarnings} />}

      {/* Commission Details */}
      {commissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Commission History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {commissions.map((commission) => (
                <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Order: {commission.orders.description.split('\n')[0]}</p>
                    <p className="text-sm text-muted-foreground">
                      Referral Code: {commission.referrals.referral_code}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Order Date: {format(new Date(commission.orders.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-bold text-lg">{formatCurrency(commission.amount)}</p>
                    <Badge variant={commission.orders.status === 'completed' ? 'default' : 'secondary'}>
                      {commission.orders.status === 'completed' ? 'Completed' : 'Pending'}
                    </Badge>
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