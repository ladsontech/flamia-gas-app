import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Share2, Copy, Users, DollarSign, Clock, CheckCircle, ArrowRight, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { OrderService } from '@/services/orderService';
import { WithdrawalSection } from './WithdrawalSection';
import { ReferralAdvert } from '../referral/ReferralAdvert';

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

export const ReferralHub: React.FC = () => {
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string>('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingEarnings, setPendingEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showCommissionDetails, setShowCommissionDetails] = useState(false);

  useEffect(() => {
    fetchReferralData();

    // Set up real-time subscription for updates
    const channel = supabase
      .channel('referral-hub-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'commissions'
      }, () => {
        fetchReferralData();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders'
      }, () => {
        fetchReferralData();
      })
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
    } catch (error) {
      console.error('Error fetching referral data:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load referral information",
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
        title: "Success!",
        description: "Your referral code has been generated"
      });
    } catch (error: any) {
      toast({
        title: "Error",
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
      title: "Copied!",
      description: "Referral link copied to clipboard"
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

  const parseOrderDescription = (description: string) => {
    const desc = description.toLowerCase();
    
    // Extract brand name
    let brand = 'Gas';
    const brandPatterns = [
      { pattern: /c\s*[-_]?\s*gas|cgas/i, name: 'C Gas' },
      { pattern: /nova/i, name: 'Nova' },
      { pattern: /shell/i, name: 'Shell' },
      { pattern: /total\s*energies|totalenergies|total/i, name: 'Total' },
      { pattern: /hass/i, name: 'Hass' },
      { pattern: /oryx/i, name: 'Oryx' },
      { pattern: /stabex/i, name: 'Stabex' },
      { pattern: /ultimate/i, name: 'Ultimate' }
    ];

    for (const { pattern, name } of brandPatterns) {
      if (pattern.test(description)) {
        brand = name;
        break;
      }
    }

    // Extract type (full/refill)
    let type = 'Gas';
    if (desc.includes('refill')) type = 'Refill';
    else if (desc.includes('full') || desc.includes('kit')) type = 'Full Kit';

    // Extract weight
    let weight = '';
    const weightMatch = description.match(/(\d+)\s*kg/i);
    if (weightMatch) {
      weight = `${weightMatch[1]}kg`;
    }

    return { brand, type, weight };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingCommissions = commissions.filter(c => c.status === 'pending' || c.orders.status !== 'completed');

  return (
    <div className="space-y-6">
      {/* How It Works Section */}
      <Card className="border-l-4 border-l-accent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="w-5 h-5 text-accent" />
            How Referral Earnings Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-accent">1</span>
              </div>
              <div>
                <p className="font-medium text-sm">Share Your Code</p>
                <p className="text-xs text-muted-foreground">Friends sign up with your link</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-accent">2</span>
              </div>
              <div>
                <p className="font-medium text-sm">They Order Gas</p>
                <p className="text-xs text-muted-foreground">Each order creates commission</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-orange-600">3</span>
              </div>
              <div>
                <p className="font-medium text-sm">Get Paid</p>
                <p className="text-xs text-muted-foreground">Withdraw when orders complete</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">3kg Gas:</span>
              <span className="font-medium text-accent">UGX 4,000</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">6kg Gas:</span>
              <span className="font-medium text-accent">UGX 5,000</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">12kg Gas:</span>
              <span className="font-medium text-accent">UGX 10,000</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Full Kits:</span>
              <span className="font-medium text-accent">UGX 10,000</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Code Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Your Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!referralCode ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">Generate your unique referral code to start earning</p>
              <Button onClick={generateReferralCode} disabled={generating} size="lg">
                {generating ? "Generating..." : "Generate Referral Code"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Your referral link:</p>
                <Input 
                  value={`${window.location.origin}/signup?ref=${referralCode}`}
                  readOnly 
                  className="text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={copyReferralLink} variant="outline" className="flex-1">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button onClick={shareReferralLink} className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Link
                </Button>
              </div>
              <div className="text-center">
                <Badge variant="secondary">Code: {referralCode}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Promotional Poster */}
      {referralCode && (
        <Card>
          <CardHeader>
            <CardTitle>Print & Share Flamia Poster</CardTitle>
          </CardHeader>
          <CardContent>
            <ReferralAdvert 
              referralCode={referralCode}
              referralLink={`${window.location.origin}/signup?ref=${referralCode}`}
            />
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      {referralCode && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
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
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available to Withdraw</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Earnings</p>
                  <p className="text-2xl font-bold">{formatCurrency(pendingEarnings)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Withdrawal Section */}
      {totalEarnings > 0 && (
        <WithdrawalSection completedEarnings={totalEarnings} />
      )}

      {/* Commission History */}
      {commissions.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Commission History
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCommissionDetails(!showCommissionDetails)}
            >
              {showCommissionDetails ? 'Hide Details' : 'Show Details'}
              <ArrowRight className={`w-4 h-4 ml-1 transition-transform ${showCommissionDetails ? 'rotate-90' : ''}`} />
            </Button>
          </CardHeader>
          {showCommissionDetails && (
            <CardContent>
              <div className="space-y-3">
                {commissions.map((commission) => {
                  const orderInfo = parseOrderDescription(commission.orders.description);
                  return (
                    <div key={commission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">
                          {orderInfo.brand} {orderInfo.weight} {orderInfo.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(commission.orders.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-bold">{formatCurrency(commission.amount)}</p>
                        <Badge 
                          variant={commission.orders.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {commission.orders.status === 'completed' ? 'Completed' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};