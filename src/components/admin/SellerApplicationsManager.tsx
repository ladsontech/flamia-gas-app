import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { approveSellerApplication, rejectSellerApplication, fetchProductCategories } from '@/services/sellerService';
import type { SellerApplication } from '@/types/seller';
import type { ProductCategory } from '@/types/seller';

const SellerApplicationsManager = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('seller_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setApplications((data as SellerApplication[]) || []);
    } catch (e: any) {
      toast({ 
        title: 'Failed to load applications', 
        description: e.message, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await load();
      try {
        const cats = await fetchProductCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadData();
  }, [statusFilter]);

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'No category';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const handleReview = async (id: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await approveSellerApplication(id, notes[id]);
        toast({ title: 'Application approved', description: 'Seller shop has been created' });
      } else {
        const reviewNote = notes[id] || 'Application did not meet requirements';
        await rejectSellerApplication(id, reviewNote);
        toast({ title: 'Application rejected' });
      }
      await load();
    } catch (e: any) {
      toast({ 
        title: 'Action failed', 
        description: e.message, 
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Seller Applications</h2>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {applications.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No applications found.
        </Card>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <Card key={app.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{app.shop_name}</CardTitle>
                  <Badge variant={
                    app.status === 'approved' ? 'default' : 
                    app.status === 'rejected' ? 'destructive' : 
                    'secondary'
                  }>
                    {app.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">
                  <strong>Category:</strong> {getCategoryName(app.category_id)}
                </p>
                {app.sample_product_name && (
                  <p className="text-sm">
                    <strong>Sample Product:</strong> {app.sample_product_name}
                  </p>
                )}
                {app.description && (
                  <p className="text-sm text-muted-foreground">{app.description}</p>
                )}
                {app.sample_images && app.sample_images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {app.sample_images.map((url, idx) => (
                      <img 
                        key={idx} 
                        src={url} 
                        alt="sample" 
                        className="w-full h-24 object-cover rounded border" 
                      />
                    ))}
                  </div>
                )}

                {app.review_notes && (
                  <div className="mt-2 p-2 bg-muted rounded text-sm">
                    <strong>Admin Notes:</strong> {app.review_notes}
                  </div>
                )}

                {app.status === 'pending' && (
                  <div className="pt-3 border-t space-y-2">
                    <Textarea 
                      placeholder="Review notes (optional for approval, required for rejection)" 
                      value={notes[app.id] ?? ''} 
                      onChange={(e) => setNotes((prev) => ({ ...prev, [app.id]: e.target.value }))} 
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => handleReview(app.id, 'approve')}>
                        Approve & Create Shop
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleReview(app.id, 'reject')}
                        disabled={!notes[app.id]}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerApplicationsManager;
