import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getImagesLimit, createSellerApplication } from '@/services/adminService';

const Sell = () => {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [imagesLimit, setImagesLimit] = useState<number>(4);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    shop_name: '',
    category: '',
    description: '',
    sample_product_name: '',
    sample_images: [] as string[],
  });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      const limit = await getImagesLimit();
      setImagesLimit(limit);
    })();
  }, []);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList) return;
    const remainingSlots = Math.max(0, imagesLimit - form.sample_images.length);
    const uploadedUrls: string[] = [];
    for (let i = 0; i < filesList.length && i < remainingSlots; i++) {
      const file = filesList.item(i);
      if (!file) continue;
      const filePath = `seller-samples/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('promotions').upload(filePath, file, { upsert: false });
      if (error) {
        toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
        continue;
      }
      const { data } = supabase.storage.from('promotions').getPublicUrl(filePath);
      if (data?.publicUrl) uploadedUrls.push(data.publicUrl);
    }
    setForm((prev) => ({ ...prev, sample_images: [...prev.sample_images, ...uploadedUrls].slice(0, imagesLimit) }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast({ title: 'Sign in required', description: 'Please sign in with Google or Email first.' });
      return;
    }
    setLoading(true);
    try {
      await createSellerApplication({
        user_id: userId,
        shop_name: form.shop_name,
        category: form.category || null,
        description: form.description || null,
        sample_product_name: form.sample_product_name || null,
        sample_images: form.sample_images,
      } as any);
      setSubmitted(true);
      toast({ title: 'Application submitted', description: 'We will review and notify you.' });
    } catch (err: any) {
      toast({ title: 'Submission failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-20">
        <div className="px-4 max-w-2xl mx-auto py-6">
          <Card>
            <CardHeader>
              <CardTitle>Thanks for applying</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Your seller application is under review. We will email you once approved.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-20">
      <div className="px-4 max-w-2xl mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Request to Sell on Flamia</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="shop_name">Shop Name</Label>
                <Input id="shop_name" value={form.shop_name} onChange={(e) => setForm({ ...form, shop_name: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" placeholder="e.g., Phones, Laptops, Fashion" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="sample_product_name">Sample Product Name</Label>
                <Input id="sample_product_name" value={form.sample_product_name} onChange={(e) => setForm({ ...form, sample_product_name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="description">About Your Shop</Label>
                <Textarea id="description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <Label>Sample Images ({form.sample_images.length}/{imagesLimit})</Label>
                <Input type="file" accept="image/*" multiple onChange={handleFileChange} />
                {form.sample_images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {form.sample_images.map((url) => (
                      <img key={url} src={url} alt="sample" className="w-full h-24 object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>
              <div className="pt-2">
                <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Application'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Sell;

