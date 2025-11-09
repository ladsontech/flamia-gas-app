import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { getAffiliateCommissions, getAffiliateEarnings, type AffiliateCommission, type AffiliateEarnings } from '@/services/affiliateCommissionService';
import { format } from 'date-fns';

interface AffiliateEarningsProps {
  affiliateShopId: string;
}

export const AffiliateEarningsComponent = ({ affiliateShopId }: AffiliateEarningsProps) => {
  const [earnings, setEarnings] = useState<AffiliateEarnings>({
    totalPending: 0,
    totalApproved: 0,
    totalEarnings: 0,
    commissionsCount: 0
  });
  const [commissions, setCommissions] = useState<AffiliateCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    loadData();
  }, [affiliateShopId, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [earningsData, commissionsData] = await Promise.all([
        getAffiliateEarnings(affiliateShopId),
        getAffiliateCommissions(affiliateShopId, activeTab === 'all' ? undefined : activeTab as any)
      ]);
      setEarnings(earningsData);
      setCommissions(commissionsData);
    } catch (error) {
      console.error('Error loading affiliate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Earnings Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">UGX {earnings.totalEarnings.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{earnings.commissionsCount} commissions</p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">UGX {earnings.totalPending.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">UGX {earnings.totalApproved.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Ready for payout</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commissions List */}
      <Card>
        <CardHeader>
          <CardTitle>Commission History</CardTitle>
          <CardDescription>Track your earnings from affiliate sales</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
            </TabsList>

            <div className="mt-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading commissions...</div>
              ) : commissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No commissions found for this filter.
                </div>
              ) : (
                <div className="space-y-4">
                  {commissions.map((commission) => (
                    <Card key={commission.id} className="border-l-4 border-l-orange-500">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-start gap-3">
                            {commission.product?.image_url && (
                              <img
                                src={commission.product.image_url}
                                alt={commission.product.name}
                                className="w-16 h-16 object-cover rounded border"
                              />
                            )}
                            <div>
                              <p className="font-semibold">{commission.product?.name || 'Product'}</p>
                              <p className="text-sm text-muted-foreground">
                                Order: {commission.order_id.slice(0, 8)}...
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(commission.created_at), 'MMM dd, yyyy HH:mm')}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <p className="text-lg font-bold text-orange-600">
                              UGX {commission.commission_amount.toLocaleString()}
                            </p>
                            {getStatusBadge(commission.status)}
                            {commission.approved_at && (
                              <p className="text-xs text-muted-foreground">
                                Approved: {format(new Date(commission.approved_at), 'MMM dd, yyyy')}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Payout Notice */}
      {earnings.totalApproved > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Ready for Payout</p>
                <p className="text-sm text-green-700 mt-1">
                  You have <span className="font-bold">UGX {earnings.totalApproved.toLocaleString()}</span> in approved commissions.
                  Contact admin to request payout via Mobile Money or Bank Transfer.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

