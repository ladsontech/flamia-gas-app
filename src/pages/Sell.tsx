import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Store, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import { createSellerApplication, fetchParentCategories, fetchSellerApplicationByUser } from '@/services/sellerService';
import type { ProductCategory, SellerApplication } from '@/types/seller';
import { getImagesLimit } from '@/services/adminService';

const Sell = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [imagesLimit, setImagesLimit] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [existingApplication, setExistingApplication] = useState<SellerApplication | null>(null);
  const [form, setForm] = useState({
    shop_name: '',
    category_id: '',
    description: '',
    sample_product_name: '',
    sample_images: [] as string[],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          
          // Check for existing application
          const application = await fetchSellerApplicationByUser(user.id);
          setExistingApplication(application);
        }
        
        const limit = await getImagesLimit();
        setImagesLimit(limit);

        const cats = await fetchParentCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    setForm((prev) => ({ 
      ...prev, 
      sample_images: [...prev.sample_images, ...uploadedUrls].slice(0, imagesLimit) 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast({ 
        title: 'Sign in required', 
        description: 'Please sign in first.',
        variant: 'destructive'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (submitted || existingApplication) {
    const application = existingApplication;
    const statusConfig = {
      pending: {
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        title: 'Application Under Review',
        description: 'Your seller application is currently being reviewed by our team. We\'ll notify you once a decision is made.',
      },
      approved: {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        title: 'Application Approved!',
        description: 'Congratulations! Your seller application has been approved. You can now access your seller dashboard.',
      },
      rejected: {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        title: 'Application Rejected',
        description: application?.review_notes || 'Unfortunately, your application was not approved at this time.',
      },
    };

    const status = application?.status || 'pending';
    const config = statusConfig[status as keyof typeof statusConfig];
    const StatusIcon = config.icon;

    return (
      <div className="min-h-screen bg-background pt-16 pb-20">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader>
              <div className={`flex items-center gap-2 ${config.color} mb-2`}>
                <StatusIcon className="h-6 w-6" />
                <CardTitle>{config.title}</CardTitle>
              </div>
              <CardDescription>{config.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {application && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Shop Name:</span>
                    <span className="text-sm text-muted-foreground">{application.shop_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant={status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary'}>
                      {status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Submitted:</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(application.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={() => navigate('/account')} className="flex-1">
                  Go to My Account
                </Button>
                {status === 'approved' && (
                  <Button onClick={() => navigate('/seller/dashboard')} className="flex-1">
                    Go to Dashboard
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-6 w-6" />
              Become a Seller on Flamia
            </CardTitle>
            <CardDescription>
              Apply to sell on Flamia marketplace - Monthly fee: 50,000 UGX
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
                  Choose one main category for your shop
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
