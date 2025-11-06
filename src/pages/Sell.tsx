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
import { createSellerApplication, fetchParentCategories, fetchSellerApplicationByUser, fetchSellerShopByUser } from '@/services/sellerService';
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
  const [sellerSlug, setSellerSlug] = useState<string | null>(null);
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
          
          // Always fetch fresh data from database to avoid stale cache
          const application = await fetchSellerApplicationByUser(user.id);
          setExistingApplication(application);
          
          // Fetch shop if application is approved
          if (application?.status === 'approved') {
            const shop = await fetchSellerShopByUser(user.id);
            if (shop) {
              setSellerSlug(shop.shop_slug);
            } else {
              // Application is approved but shop doesn't exist - reset state
              console.warn('Shop not found despite approved application');
              setExistingApplication(null);
              setSellerSlug(null);
            }
          }
        }
        
        const limit = await getImagesLimit();
        setImagesLimit(limit);

        const cats = await fetchParentCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Error loading data:', error);
        // Reset state on error to allow retry
        setExistingApplication(null);
        setSellerSlug(null);
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
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        title: 'Application Under Review',
        description: 'Your seller application is currently being reviewed by our team. We\'ll notify you once a decision is made.',
      },
      approved: {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        title: 'Application Approved!',
        description: 'Congratulations! Your seller application has been approved. You can now access your seller dashboard.',
      },
      rejected: {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        title: 'Application Rejected',
        description: application?.review_notes || 'Unfortunately, your application was not approved at this time.',
      },
    };

    const status = application?.status || 'pending';
    const config = statusConfig[status as keyof typeof statusConfig];
    const StatusIcon = config.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-orange-50/20 to-background pt-16 sm:pt-20 pb-20">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-2xl">
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className={`${config.bgColor} ${config.borderColor} border-b-2 px-4 sm:px-6 py-4 sm:py-6`}>
              <div className={`flex items-center gap-3 ${config.color}`}>
                <div className={`p-2 sm:p-3 rounded-xl ${config.bgColor} border-2 ${config.borderColor}`}>
                  <StatusIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold">{config.title}</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{config.description}</p>
                </div>
              </div>
            </div>
            
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {application && (
                <div className="space-y-3 sm:space-y-4 bg-muted/30 rounded-xl p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-muted-foreground">Shop Name:</span>
                    <span className="text-sm sm:text-base font-medium text-foreground">{application.shop_name}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-muted-foreground">Status:</span>
                    <Badge 
                      variant={status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary'}
                      className="w-fit text-xs sm:text-sm px-2 sm:px-3 py-1"
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-muted-foreground">Submitted:</span>
                    <span className="text-sm sm:text-base text-foreground">
                      {new Date(application.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                <Button 
                  onClick={() => navigate('/account')} 
                  variant="outline" 
                  className="sm:flex-1 h-11 sm:h-12 text-sm sm:text-base"
                >
                  Go to My Account
                </Button>
                {status === 'approved' && (
                  <>
                    <Button 
                      onClick={() => navigate('/seller/dashboard')} 
                      className="sm:flex-1 h-11 sm:h-12 text-sm sm:text-base bg-primary hover:bg-primary/90"
                    >
                      Manage Store
                    </Button>
                    <Button 
                      onClick={() => sellerSlug && navigate(`/shop/${sellerSlug}`)} 
                      disabled={!sellerSlug}
                      className="sm:flex-1 h-11 sm:h-12 text-sm sm:text-base"
                      variant="outline"
                    >
                      Visit Storefront
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-orange-50/20 to-background pt-16 sm:pt-20 pb-20">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-2xl">
        <Card className="border-2 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-primary/20 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 sm:p-3 bg-primary/10 rounded-xl border-2 border-primary/20">
                <Store className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl md:text-3xl">Become a Seller on Flamia</CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  Apply to sell on Flamia marketplace - Monthly fee: 50,000 UGX
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="shop_name" className="text-sm sm:text-base font-semibold">Shop Name *</Label>
                <Input 
                  id="shop_name" 
                  value={form.shop_name} 
                  onChange={(e) => setForm({ ...form, shop_name: e.target.value })} 
                  placeholder="Enter your shop name"
                  className="h-11 sm:h-12 text-sm sm:text-base"
                  required 
                />
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
                  Your shop will be: <span className="font-mono font-semibold text-primary">{shopSlugPreview}.flamia.store</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm sm:text-base font-semibold">Shop Category *</Label>
                <Select 
                  value={form.category_id} 
                  onValueChange={(value) => setForm({ ...form, category_id: value })}
                  required
                >
                  <SelectTrigger className="h-11 sm:h-12 text-sm sm:text-base">
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
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
                  Choose one main category for your shop
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sample_product_name" className="text-sm sm:text-base font-semibold">Sample Product Name</Label>
                <Input 
                  id="sample_product_name" 
                  value={form.sample_product_name} 
                  onChange={(e) => setForm({ ...form, sample_product_name: e.target.value })} 
                  placeholder="Example of what you'll sell"
                  className="h-11 sm:h-12 text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm sm:text-base font-semibold">About Your Shop</Label>
                <Textarea 
                  id="description" 
                  rows={4} 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  placeholder="Tell us about your business and what you plan to sell"
                  className="text-sm sm:text-base resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-semibold">
                  Sample Images ({form.sample_images.length}/{imagesLimit})
                </Label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleFileChange}
                  disabled={form.sample_images.length >= imagesLimit}
                  className="h-11 sm:h-12 text-xs sm:text-sm"
                />
                {form.sample_images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mt-3">
                    {form.sample_images.map((url) => (
                      <div key={url} className="relative group">
                        <img 
                          src={url} 
                          alt="sample" 
                          className="w-full h-24 sm:h-32 object-cover rounded-lg border-2 border-border shadow-sm" 
                        />
                      </div>
                    ))}
                  </div>
                )}
                {form.sample_images.length >= imagesLimit && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Maximum {imagesLimit} images allowed
                  </p>
                )}
              </div>

              <div className="pt-2 space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl border border-orange-200/50">
                  <p className="font-semibold text-sm sm:text-base mb-2 sm:mb-3 text-foreground">Pricing Information</p>
                  <ul className="text-xs sm:text-sm text-muted-foreground space-y-1.5 sm:space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Basic tier: <strong className="text-foreground">50,000 UGX/month</strong> (subdomain: yourshop.flamia.store)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Premium tier: Custom domain support (coming soon)</span>
                    </li>
                  </ul>
                </div>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-11 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
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
