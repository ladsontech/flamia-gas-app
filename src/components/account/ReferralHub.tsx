import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Share2, Copy, Users, DollarSign, Clock, CheckCircle, ArrowRight, Info, Gift, Target, Zap } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="bg-card/50 backdrop-blur border">
            <CardContent className="p-8">
              <div className="animate-pulse space-y-6">
                <div className="space-y-3">
                  <div className="h-8 bg-muted rounded-lg w-2/3 mx-auto"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-muted rounded-lg"></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Gift className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Earn with Every Referral
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Share Flamia with friends and earn commission on every order they make
          </p>
        </div>

        {/* Stats Cards */}
        {referralCode && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/50 backdrop-blur border hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-500/10 rounded-full">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Referrals</p>
                    <p className="text-2xl font-bold">{referrals.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-500/10 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalEarnings)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(pendingEarnings)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* How It Works */}
        <Card className="bg-card/50 backdrop-blur border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="font-semibold">Share Your Link</h3>
                <p className="text-sm text-muted-foreground">Friends sign up using your referral link</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="font-semibold">They Order Gas</h3>
                <p className="text-sm text-muted-foreground">Each completed order generates commission</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="font-semibold">Get Paid</h3>
                <p className="text-sm text-muted-foreground">Withdraw your earnings instantly</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { size: '3kg Gas', amount: 'UGX 4,000' },
                { size: '6kg Gas', amount: 'UGX 5,000' },
                { size: '12kg Gas', amount: 'UGX 10,000' },
                { size: 'Full Kits', amount: 'UGX 10,000' }
              ].map((rate, index) => (
                <div key={index} className="text-center p-3 bg-primary/5 rounded-lg border">
                  <p className="text-sm font-medium">{rate.size}</p>
                  <p className="text-lg font-bold text-primary">{rate.amount}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Referral Code Section */}
        <Card className="bg-card/50 backdrop-blur border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              Your Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!referralCode ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Generate Your Code</h3>
                  <p className="text-muted-foreground">Create your unique referral code to start earning</p>
                </div>
                <Button 
                  onClick={generateReferralCode} 
                  disabled={generating} 
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  {generating ? "Generating..." : "Generate Code"}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <Badge variant="secondary" className="px-4 py-2 text-lg">
                    {referralCode}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Referral Link</label>
                  <Input 
                    value={`${window.location.origin}/signup?ref=${referralCode}`}
                    readOnly 
                    className="font-mono text-sm"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={copyReferralLink} 
                    variant="outline" 
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button 
                    onClick={shareReferralLink} 
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Link
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Promotional Poster */}
        {referralCode && (
          <Card className="bg-card/50 backdrop-blur border">
            <CardHeader>
              <CardTitle>Share Poster</CardTitle>
            </CardHeader>
            <CardContent>
              <ReferralAdvert 
                referralCode={referralCode}
                referralLink={`${window.location.origin}/signup?ref=${referralCode}`}
              />
            </CardContent>
          </Card>
        )}

        {/* Withdrawal Section */}
        {totalEarnings > 0 && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <WithdrawalSection completedEarnings={totalEarnings} />
            </CardContent>
          </Card>
        )}

        {/* Commission History */}
        {commissions.length > 0 && (
          <Card className="bg-card/50 backdrop-blur border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Commission History
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCommissionDetails(!showCommissionDetails)}
                >
                  {showCommissionDetails ? 'Hide' : 'Show'} Details
                  <ArrowRight className={`w-4 h-4 ml-2 transition-transform ${showCommissionDetails ? 'rotate-90' : ''}`} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showCommissionDetails && (
                <div className="space-y-3">
                  {commissions.map((commission) => {
                    const orderDetails = parseOrderDescription(commission.orders.description);
                    
                    return (
                      <div key={commission.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={commission.status === 'completed' ? 'default' : 'secondary'}
                              className={commission.status === 'completed' ? 'bg-green-500 text-white' : ''}
                            >
                              {commission.status === 'completed' ? 'Paid' : 'Pending'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(commission.created_at), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <p className="font-medium">
                            {orderDetails.brand} {orderDetails.type} {orderDetails.weight}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(commission.amount)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};