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
import { toast } from 'sonner';
import { fetchParentCategories, fetchSellerApplicationByUser, fetchSellerShopByUser, updateSellerShop } from '@/services/sellerService';
import { BackButton } from '@/components/BackButton';
import { Store, Image, FileText, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function SellerOnboarding() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
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

  const progress = (step / 3) * 100;

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
        toast.error('Failed to load onboarding.');
        navigate('/sell');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const handleNext = () => {
    if (step === 1) {
      if (!form.shop_name.trim()) {
        toast.error('Please enter a shop name');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!form.shop_description.trim()) {
        toast.error('Please add a shop description');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3);
    }
  };

  const handleComplete = async () => {
    if (!userId) return;
    if (!form.shop_name || !form.category_id) {
      toast.error('Please provide shop name and category.');
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
        toast.success('Your store details have been saved!');
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
          throw error;
        }
        toast.success('Your store is ready!');
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
      toast.error(e.message || 'Failed to save store. Please try again.');
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
      <BackButton />
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-3xl">
        {/* Progress Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl sm:text-2xl font-bold">Set Up Your Store</h1>
            <span className="text-sm text-muted-foreground">Step {step} of 3</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-4 sm:mt-6">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {step > 1 ? <CheckCircle className="w-5 h-5" /> : <Store className="w-4 h-4" />}
              </div>
              <span className="hidden sm:inline text-sm font-medium">Basic Info</span>
            </div>
            
            <div className="flex-1 h-0.5 bg-muted mx-2" />
            
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {step > 2 ? <CheckCircle className="w-5 h-5" /> : <FileText className="w-4 h-4" />}
              </div>
              <span className="hidden sm:inline text-sm font-medium">Description</span>
            </div>
            
            <div className="flex-1 h-0.5 bg-muted mx-2" />
            
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <Image className="w-4 h-4" />
              </div>
              <span className="hidden sm:inline text-sm font-medium">Category</span>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Store Name & Logo'}
              {step === 2 && 'Store Description'}
              {step === 3 && 'Store Category'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="shop_name" className="text-base font-semibold">
                    Shop Name <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="shop_name" 
                    value={form.shop_name} 
                    onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
                    placeholder="Enter your shop name"
                    className="h-11 text-base"
                    autoFocus
                  />
                  <p className="text-sm text-muted-foreground">
                    This will be your store's display name
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Shop Logo (Optional)</Label>
                  <ShopImageUpload 
                    bucket="shop-logos" 
                    onUploadComplete={(url) => setForm({ ...form, shop_logo_url: url })} 
                    currentImage={form.shop_logo_url} 
                  />
                  <p className="text-sm text-muted-foreground">
                    Add a logo to make your store more recognizable
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Description */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="shop_description" className="text-base font-semibold">
                    Shop Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea 
                    id="shop_description" 
                    rows={5} 
                    value={form.shop_description} 
                    onChange={(e) => setForm({ ...form, shop_description: e.target.value })}
                    placeholder="Tell customers about your store, what you sell, and what makes you unique..."
                    className="text-base resize-none"
                    autoFocus
                  />
                  <p className="text-sm text-muted-foreground">
                    A good description helps customers understand what you offer
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="delivery_terms" className="text-base font-semibold">
                    Delivery Terms (Optional)
                  </Label>
                  <Textarea 
                    id="delivery_terms" 
                    rows={3} 
                    value={form.delivery_terms} 
                    onChange={(e) => setForm({ ...form, delivery_terms: e.target.value })}
                    placeholder="e.g., Free delivery within Kampala, 2-3 business days..."
                    className="text-base resize-none"
                  />
                  <p className="text-sm text-muted-foreground">
                    Let customers know your delivery policy
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Category */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    Main Store Category <span className="text-destructive">*</span>
                  </Label>
                  <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue placeholder="Select your main category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Choose the category that best describes your business. You'll select specific subcategories when adding products.
                  </p>
                </div>

                {/* Summary Preview */}
                {form.shop_name && form.shop_description && (
                  <div className="p-4 bg-muted rounded-lg space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase">Preview</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {form.shop_logo_url && (
                          <img src={form.shop_logo_url} alt="Logo" className="w-12 h-12 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="font-bold">{form.shop_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {categories.find(c => c.id === form.category_id)?.name || 'Category not selected'}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm line-clamp-2">{form.shop_description}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={step === 1 || submitting}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              
              {step < 3 ? (
                <Button onClick={handleNext} className="gap-2">
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleComplete} 
                  disabled={submitting || !form.category_id}
                  className="gap-2"
                >
                  {submitting ? 'Setting up...' : 'Complete Setup'}
                  <CheckCircle className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

