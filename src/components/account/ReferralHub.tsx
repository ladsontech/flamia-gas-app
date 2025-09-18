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

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="animate-pulse space-y-6">
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded-lg w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      
      {/* ========== HOW IT WORKS SECTION ========== */}
      <Card className="border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl text-orange-700">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Info className="w-5 h-5 text-orange-600" />
            </div>
            How Referral Earnings Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-lg font-bold text-white">1</span>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-gray-900">Share Your Code</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Friends sign up using your referral link and create their account
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-lg font-bold text-white">2</span>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-gray-900">They Order Gas</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Each completed gas order generates commission for you
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-lg font-bold text-white">3</span>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-gray-900">Get Paid</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Withdraw your earnings once orders are completed
                </p>
              </div>
            </div>
          </div>
          
          <Separator className="bg-orange-200" />
          
          {/* Commission Rates */}
          <div className="bg-white rounded-lg p-6 border border-orange-200">
            <h4 className="font-semibold text-gray-900 mb-4 text-center">Commission Rates</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { size: '3kg Gas', amount: 'UGX 4,000' },
                { size: '6kg Gas', amount: 'UGX 5,000' },
                { size: '12kg Gas', amount: 'UGX 10,000' },
                { size: 'Full Kits', amount: 'UGX 10,000' }
              ].map((rate, index) => (
                <div key={index} className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <p className="text-sm font-medium text-gray-700">{rate.size}</p>
                  <p className="text-lg font-bold text-orange-600">{rate.amount}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========== REFERRAL CODE SECTION ========== */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Share2 className="w-6 h-6" />
            Your Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          {!referralCode ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Generate Your Referral Code
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Create your unique referral code to start earning commissions from friends' orders
              </p>
              <Button 
                onClick={generateReferralCode} 
                disabled={generating} 
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3"
              >
                {generating ? "Generating..." : "Generate Referral Code"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Referral Link Display */}
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Referral Link:
                </label>
                <Input 
                  value={`${window.location.origin}/signup?ref=${referralCode}`}
                  readOnly 
                  className="text-sm font-mono bg-white"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={copyReferralLink} 
                  variant="outline" 
                  className="flex-1 h-12 border-2 hover:border-orange-300"
                >
                  <Copy className="w-5 h-5 mr-2" />
                  Copy Link
                </Button>
                <Button 
                  onClick={shareReferralLink} 
                  className="flex-1 h-12 bg-orange-500 hover:bg-orange-600"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Link
                </Button>
              </div>
              
              {/* Referral Code Badge */}
              <div className="text-center">
                <Badge 
                  variant="secondary" 
                  className="px-4 py-2 text-lg bg-orange-100 text-orange-700 border border-orange-200"
                >
                  Code: {referralCode}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========== PROMOTIONAL POSTER SECTION ========== */}
      {referralCode && (
        <Card>
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardTitle className="text-xl">Print & Share Flamia Poster</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <ReferralAdvert 
              referralCode={referralCode}
              referralLink={`${window.location.origin}/signup?ref=${referralCode}`}
            />
          </CardContent>
        </Card>
      )}

      {/* ========== STATS OVERVIEW SECTION ========== */}
      {referralCode && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                  <p className="text-3xl font-bold text-gray-900">{referrals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Available to Withdraw</p>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(totalEarnings)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-7 h-7 text-orange-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Pending Earnings</p>
                  <p className="text-3xl font-bold text-orange-600">{formatCurrency(pendingEarnings)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========== WITHDRAWAL SECTION ========== */}
      {totalEarnings > 0 && (
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-white">
          <CardContent className="p-8">
            <WithdrawalSection completedEarnings={totalEarnings} />
          </CardContent>
        </Card>
      )}

      {/* ========== COMMISSION HISTORY SECTION ========== */}
      {commissions.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardTitle className="flex items-center gap-3 text-xl">
              <DollarSign className="w-6 h-6" />
              Commission History
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCommissionDetails(!showCommissionDetails)}
              className="text-white hover:bg-white/20 border border-white/30"
            >
              {showCommissionDetails ? 'Hide Details' : 'Show Details'}
              <ArrowRight className={`w-4 h-4 ml-2 transition-transform ${showCommissionDetails ? 'rotate-90' : ''}`} />
            </Button>
          </CardHeader>
          
          {showCommissionDetails && (
            <CardContent className="p-6">
              <div className="space-y-4">
                {commissions.map((commission, index) => {
                  const orderInfo = parseOrderDescription(commission.orders.description);
                  return (
                    <div 
                      key={commission.id} 
                      className="flex items-center justify-between p-4 border-2 rounded-lg hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-orange-600">
                            {index + 1}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-900">
                            {orderInfo.brand} {orderInfo.weight} {orderInfo.type}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(commission.orders.created_at), 'MMM d, yyyy • h:mm a')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(commission.amount)}
                        </p>
                        <Badge 
                          variant={commission.orders.status === 'completed' ? 'default' : 'secondary'}
                          className={`text-xs ${
                            commission.orders.status === 'completed' 
                              ? 'bg-green-100 text-green-700 border-green-200' 
                              : 'bg-orange-100 text-orange-700 border-orange-200'
                          }`}
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