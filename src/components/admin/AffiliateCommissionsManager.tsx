import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  getAllPendingCommissions,
  approveAffiliateCommission,
  cancelAffiliateCommission,
  type AffiliateCommission
} from '@/services/affiliateCommissionService';
import { CheckCircle, XCircle, Loader2, DollarSign, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const AffiliateCommissionsManager = () => {
  const [commissions, setCommissions] = useState<AffiliateCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'approve' | 'cancel' } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCommissions();
  }, []);

  const loadCommissions = async () => {
    setLoading(true);
    try {
      const data = await getAllPendingCommissions();
      setCommissions(data);
    } catch (error) {
      console.error('Error loading commissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pending commissions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const success = await approveAffiliateCommission(id);
      if (success) {
        toast({
          title: 'Commission Approved',
          description: 'The affiliate commission has been approved for payout.'
        });
        loadCommissions();
      } else {
        throw new Error('Failed to approve commission');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve commission',
        variant: 'destructive'
      });
    } finally {
      setProcessingId(null);
      setConfirmAction(null);
    }
  };

  const handleCancel = async (id: string) => {
    setProcessingId(id);
    try {
      const success = await cancelAffiliateCommission(id);
      if (success) {
        toast({
          title: 'Commission Cancelled',
          description: 'The affiliate commission has been cancelled.'
        });
        loadCommissions();
      } else {
        throw new Error('Failed to cancel commission');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel commission',
        variant: 'destructive'
      });
    } finally {
      setProcessingId(null);
      setConfirmAction(null);
    }
  };

  const totalPending = commissions.reduce((sum, c) => sum + c.commission_amount, 0);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Affiliate Commissions
              </CardTitle>
              <CardDescription>Review and approve pending affiliate commissions</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Pending</p>
              <p className="text-2xl font-bold text-orange-600">
                UGX {totalPending.toLocaleString()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : commissions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Pending Commissions</h3>
              <p className="text-muted-foreground">All affiliate commissions have been processed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {commissions.map((commission: any) => (
                <Card key={commission.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Commission Info */}
                      <div className="flex items-start gap-4 flex-1">
                        {commission.product?.image_url && (
                          <img
                            src={commission.product.image_url}
                            alt={commission.product.name}
                            className="w-20 h-20 object-cover rounded border"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-1">
                            {commission.product?.name || 'Product'}
                          </h4>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="font-medium">
                                {commission.affiliate_shop?.shop_name || 'Affiliate Shop'}
                              </span>
                            </p>
                            <p>Order ID: {commission.order_id.slice(0, 8)}...</p>
                            <p>Date: {format(new Date(commission.created_at), 'MMM dd, yyyy HH:mm')}</p>
                          </div>
                        </div>
                      </div>

                      {/* Commission Amount & Actions */}
                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Commission</p>
                          <p className="text-2xl font-bold text-orange-600">
                            UGX {commission.commission_amount.toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending Approval
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirmAction({ id: commission.id, action: 'cancel' })}
                            disabled={processingId === commission.id}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            {processingId === commission.id ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4 mr-1" />
                            )}
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setConfirmAction({ id: commission.id, action: 'approve' })}
                            disabled={processingId === commission.id}
                          >
                            {processingId === commission.id ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-1" />
                            )}
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.action === 'approve' ? 'Approve Commission?' : 'Cancel Commission?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.action === 'approve'
                ? 'This will mark the commission as approved and ready for payout. The affiliate will be notified.'
                : 'This will cancel the commission. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmAction) {
                  if (confirmAction.action === 'approve') {
                    handleApprove(confirmAction.id);
                  } else {
                    handleCancel(confirmAction.id);
                  }
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

