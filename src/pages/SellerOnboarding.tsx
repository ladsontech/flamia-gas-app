import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShopImageUpload } from '@/components/shop/ShopImageUpload';
import { useToast } from '@/hooks/use-toast';
import { fetchParentCategories, fetchSellerApplicationByUser, fetchSellerShopByUser, updateSellerShop } from '@/services/sellerService';

export default function SellerOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    shop_name: '',
    shop_logo_url: '',
    shop_description: '',
    delivery_terms: '',
    category_id: '',
  });
  const [existingShop, setExistingShop] = useState<any | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/signin');
          return;
        }
        setUserId(user.id);

        const app = await fetchSellerApplicationByUser(user.id);
        if (!app || app.status !== 'approved') {
          navigate('/sell');
          return;
        }
        const cats = await fetchParentCategories();
        setCategories(cats);
        setForm(prev => ({
          ...prev,
          shop_name: app.shop_name || prev.shop_name,
          shop_description: app.description || prev.shop_description,
          category_id: app.category_id || prev.category_id,
        }));

        // Check if an approved shop already exists (created by admin on approval)
        const shop = await fetchSellerShopByUser(user.id);
        if (shop) {
          setExistingShop(shop);
          setForm(prev => ({
            ...prev,
            shop_name: shop.shop_name || prev.shop_name,
            shop_logo_url: shop.shop_logo_url || prev.shop_logo_url,
            shop_description: shop.shop_description || prev.shop_description,
            category_id: shop.category_id || prev.category_id,
          }));
        }
      } catch (e) {
        console.error(e);
        toast({ title: 'Error', description: 'Failed to load onboarding.', variant: 'destructive' });
        navigate('/sell');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate, toast]);

  const handleCreateStore = async () => {
    if (!userId) return;
    if (!form.shop_name || !form.category_id) {
      toast({ title: 'Missing info', description: 'Please provide shop name and category.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      if (existingShop) {
        // Update existing shop created during approval
        await updateSellerShop(existingShop.id, {
          shop_name: form.shop_name,
          shop_description: form.shop_description || null,
          shop_logo_url: form.shop_logo_url || null,
          category_id: form.category_id,
        });
        toast({ title: 'Store updated', description: 'Your store details have been saved. Add products next!' });
      } else {
        // Attempt to provision via Supabase Edge Function with service role
        const { data, error } = await supabase.functions.invoke('provision-seller-shop', {
          body: {
            shopName: form.shop_name,
            categoryId: form.category_id,
            shopDescription: form.shop_description || null,
            shopLogoUrl: form.shop_logo_url || null,
          }
        });
        if (error) {
          // Fallback: if function network fails, try to update an existing approved shop record
          console.warn('Edge function error, attempting fallback:', error);
          const fallbackShop = await fetchSellerShopByUser(userId);
          if (fallbackShop) {
            await updateSellerShop(fallbackShop.id, {
              shop_name: form.shop_name,
              shop_description: form.shop_description || null,
              shop_logo_url: form.shop_logo_url || null,
              category_id: form.category_id,
            });
          } else {
            throw error;
          }
        }
        // After successful provision, go to dashboard
        toast({ title: 'Store created', description: 'Your store is ready. Add your first products next!' });
      }
      // Mark onboarding completed after store is created or updated post-approval
      const nowIso = new Date().toISOString();
      await supabase.from('profiles').upsert({
        id: userId,
        onboarding_completed: true,
        updated_at: nowIso
      }, { onConflict: 'id' });
      navigate('/seller/dashboard');
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Failed to save store', description: e.message || 'Please try again', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading onboarding...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl">Seller Onboarding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shop_name">Shop Name *</Label>
                  <Input id="shop_name" value={form.shop_name} onChange={(e) => setForm({ ...form, shop_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Shop Logo</Label>
                  <ShopImageUpload bucket="shop-logos" onUploadComplete={(url) => setForm({ ...form, shop_logo_url: url })} currentImage={form.shop_logo_url} />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)}>Next</Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shop_description">Shop Description</Label>
                  <Textarea id="shop_description" rows={4} value={form.shop_description} onChange={(e) => setForm({ ...form, shop_description: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_terms">Delivery Terms (optional)</Label>
                  <Textarea id="delivery_terms" rows={3} value={form.delivery_terms} onChange={(e) => setForm({ ...form, delivery_terms: e.target.value })} />
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => setStep(3)}>Next</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Primary Category *</Label>
                  <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={handleCreateStore} disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Store'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

