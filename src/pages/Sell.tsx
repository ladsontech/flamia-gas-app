import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getImagesLimit } from '@/services/adminService';
import { createSellerApplication, fetchParentCategories } from '@/services/sellerService';
import type { ProductCategory } from '@/types/seller';

const Sell = () => {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [imagesLimit, setImagesLimit] = useState<number>(4);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [form, setForm] = useState({
    shop_name: '',
    category_id: '',
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
      
      try {
        const cats = await fetchParentCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
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
      toast({ 
        title: 'Sign in required', 
        description: 'Please sign in with Google or Email first.' 
      });
      return;
    }

    if (!form.category_id) {
      toast({
        title: 'Category required',
        description: 'Please select a category for your shop.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await createSellerApplication({
        user_id: userId,
        shop_name: form.shop_name,
        category_id: form.category_id,
        description: form.description || undefined,
        sample_product_name: form.sample_product_name || undefined,
        sample_images: form.sample_images,
      });
      setSubmitted(true);
      toast({ 
        title: 'Application submitted', 
        description: 'We will review and notify you.' 
      });
    } catch (err: any) {
      toast({ 
        title: 'Submission failed', 
        description: err.message, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const shopSlugPreview = form.shop_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'your-shop';

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
            <CardDescription>
              Apply to sell on Flamia - Monthly fee: 50,000 UGX
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="shop_name">Shop Name *</Label>
                <Input 
                  id="shop_name" 
                  value={form.shop_name} 
                  onChange={(e) => setForm({ ...form, shop_name: e.target.value })} 
                  placeholder="Enter your shop name"
                  required 
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Your shop will be: <span className="font-mono font-semibold">{shopSlugPreview}.flamia.store</span>
                </p>
              </div>

              <div>
                <Label htmlFor="category">Shop Category *</Label>
                <Select 
                  value={form.category_id} 
                  onValueChange={(value) => setForm({ ...form, category_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your shop category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose one main category for your shop (you can add products in subcategories later)
                </p>
              </div>

              <div>
                <Label htmlFor="sample_product_name">Sample Product Name</Label>
                <Input 
                  id="sample_product_name" 
                  value={form.sample_product_name} 
                  onChange={(e) => setForm({ ...form, sample_product_name: e.target.value })} 
                  placeholder="Example of what you'll sell"
                />
              </div>

              <div>
                <Label htmlFor="description">About Your Shop</Label>
                <Textarea 
                  id="description" 
                  rows={4} 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  placeholder="Tell us about your business and what you plan to sell"
                />
              </div>

              <div>
                <Label>Sample Images ({form.sample_images.length}/{imagesLimit})</Label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleFileChange}
                  disabled={form.sample_images.length >= imagesLimit}
                />
                {form.sample_images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {form.sample_images.map((url) => (
                      <img 
                        key={url} 
                        src={url} 
                        alt="sample" 
                        className="w-full h-24 object-cover rounded border" 
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 space-y-2">
                <div className="p-3 bg-muted rounded-md text-sm">
                  <p className="font-semibold mb-1">Pricing:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Basic tier: 50,000 UGX/month (subdomain: yourshop.flamia.store)</li>
                    <li>Premium tier: Custom domain support (coming soon)</li>
                  </ul>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Sell;
