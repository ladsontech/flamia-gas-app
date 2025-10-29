import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAffiliateShop } from '@/hooks/useAffiliateShop';
import { 
  createAffiliateShop, 
  updateAffiliateShop, 
  addProductToAffiliateShop,
  removeProductFromAffiliateShop,
  fetchAffiliateShopProducts,
  countAffiliateShopProducts
} from '@/services/affiliateService';
import { AffiliateShopSettings } from '@/components/affiliate/AffiliateShopSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Package, Store, DollarSign, BarChart3, Plus, TrendingUp, Loader2, Trash2, ExternalLink, Copy, Crown, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BusinessProduct } from '@/types/business';
import type { AffiliateShopProduct } from '@/types/affiliate';
import { BackButton } from '@/components/BackButton';
import { ShopImageUpload } from '@/components/shop/ShopImageUpload';
import { ProductPreviewModal } from '@/components/shop/ProductPreviewModal';

export default function AffiliateDashboard() {
  const navigate = useNavigate();
  const { shop, loading: shopLoading } = useAffiliateShop();
  const [isCreating, setIsCreating] = useState(false);
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [shopLogoUrl, setShopLogoUrl] = useState('');
  const [availableProducts, setAvailableProducts] = useState<BusinessProduct[]>([]);
  const [affiliateProducts, setAffiliateProducts] = useState<AffiliateShopProduct[]>([]);
  const [productsCount, setProductsCount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [commissionRate, setCommissionRate] = useState('10');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<BusinessProduct | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalClicks: 0,
    totalOrders: 0,
    totalCommissions: 0,
    conversionRate: 0
  });

  useEffect(() => {
    if (!shopLoading && !shop) {
      // No shop exists, stay on creation mode
    } else if (shop) {
      loadShopData();
    }
  }, [shop, shopLoading]);

  const loadShopData = async () => {
    if (!shop) return;

    try {
      // Load available products from sellers
      const { data: products, error: productsError } = await supabase
        .from('business_products')
        .select('*, businesses(name)')
        .eq('is_available', true)
        .eq('affiliate_enabled', true);

      if (productsError) throw productsError;
      setAvailableProducts((products || []) as BusinessProduct[]);

      // Load current affiliate products
      const shopProducts = await fetchAffiliateShopProducts(shop.id);
      setAffiliateProducts(shopProducts);

      // Get product count
      const count = await countAffiliateShopProducts(shop.id);
      setProductsCount(count);

      // Load analytics
      const { data: affiliateOrders } = await supabase
        .from('affiliate_orders')
        .select('commission_amount, status')
        .eq('affiliate_shop_id', shop.id);

      const totalOrders = affiliateOrders?.length || 0;
      const totalCommissions = affiliateOrders
        ?.filter(o => o.status === 'approved')
        .reduce((sum, order) => sum + order.commission_amount, 0) || 0;

      setAnalytics({
        totalClicks: 0, // Would need tracking implementation
        totalOrders,
        totalCommissions,
        conversionRate: 0 // Would need clicks data
      });
    } catch (error: any) {
      console.error('Error loading shop data:', error);
      toast.error('Failed to load shop data');
    }
  };

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) {
      toast.error('Please enter a shop name');
      return;
    }

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await createAffiliateShop({
        user_id: user.id,
        shop_name: shopName,
        shop_description: shopDescription || null,
        shop_logo_url: shopLogoUrl || null,
        tier: 'free',
        is_active: true,
        monthly_fee: 0,
      });

      toast.success('Affiliate shop created successfully!');
      window.location.reload();
    } catch (error: any) {
      console.error('Error creating shop:', error);
      toast.error('Failed to create shop');
    } finally {
      setIsCreating(false);
    }
  };

  const handleProductPreview = (product: BusinessProduct) => {
    setPreviewProduct(product);
    setPreviewOpen(true);
  };

  const handleAddProduct = async () => {
    if (!shop || !previewProduct) return;

    // Check product limit for free tier
    if (shop.tier === 'free' && productsCount >= 15) {
      toast.error('Free tier is limited to 15 products. Upgrade to premium for unlimited products.');
      return;
    }

    setIsAddingProduct(true);
    try {
      const commissionRate = previewProduct.commission_rate || 10;
      await addProductToAffiliateShop(
        shop.id,
        previewProduct.id,
        commissionRate,
        'percentage'
      );

      toast.success('Product added to your shop!');
      setPreviewOpen(false);
      setPreviewProduct(null);
      loadShopData();
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    try {
      await removeProductFromAffiliateShop(productId);
      toast.success('Product removed from your shop');
      loadShopData();
    } catch (error: any) {
      console.error('Error removing product:', error);
      toast.error('Failed to remove product');
    }
  };

  const copyShopLink = () => {
    if (!shop) return;
    const link = `https://${shop.shop_slug}.flamia.store`;
    navigator.clipboard.writeText(link);
    toast.success('Shop link copied to clipboard!');
  };

  if (shopLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Create shop form
  if (!shop) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-20">
        <BackButton />
        <div className="container max-w-2xl mx-auto px-4 py-6 sm:py-8">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Create Affiliate Shop</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Start earning commissions</p>
              </div>
            </div>

            <form onSubmit={handleCreateShop} className="space-y-4">
              <div>
                <Label htmlFor="shopName">Shop Name *</Label>
                <Input
                  id="shopName"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="My Affiliate Store"
                  required
                />
              </div>

              <div>
                <Label htmlFor="shopDescription">Description</Label>
                <Textarea
                  id="shopDescription"
                  value={shopDescription}
                  onChange={(e) => setShopDescription(e.target.value)}
                  placeholder="Tell customers about your shop..."
                  rows={4}
                />
              </div>

              <ShopImageUpload
                bucket="shop-logos"
                onUploadComplete={setShopLogoUrl}
                currentImage={shopLogoUrl}
                title="Shop Logo"
              />

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Free Tier Includes:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Up to 15 products</li>
                  <li>• Unique shop link</li>
                  <li>• Commission tracking</li>
                  <li>• Analytics dashboard</li>
                </ul>
              </div>

              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Shop
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  // Dashboard view
  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      <BackButton />
      <div className="container max-w-6xl mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            {shop.shop_logo_url ? (
              <img src={shop.shop_logo_url} alt={shop.shop_name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{shop.shop_name}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {shop.tier === 'free' ? `${productsCount}/15 products` : `${productsCount} products`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyShopLink} size="sm" className="flex-1 sm:flex-none">
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button onClick={() => window.open(`https://${shop.shop_slug}.flamia.store`, '_blank')} size="sm" className="flex-1 sm:flex-none">
              <ExternalLink className="w-4 h-4 mr-2" />
              View
            </Button>
          </div>
        </div>

        {/* Tier Badge */}
        {shop.tier === 'free' && (
          <Card className="p-4 mb-6 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-semibold">Free Tier - Limited to 15 Products</p>
                  <p className="text-sm text-muted-foreground">Upgrade to premium for unlimited products</p>
                </div>
              </div>
              <Button variant="default">Upgrade</Button>
            </div>
          </Card>
        )}

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Products</CardTitle>
              <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{productsCount}</div>
              <p className="text-xs text-muted-foreground">
                {shop.tier === 'free' ? `${15 - productsCount} left` : 'Unlimited'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Orders</CardTitle>
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{analytics.totalOrders}</div>
              <p className="text-xs text-muted-foreground">Promoted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Commissions</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-lg sm:text-2xl font-bold">UGX {(analytics.totalCommissions / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground">Approved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Avg</CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-lg sm:text-2xl font-bold">
                UGX {analytics.totalOrders > 0 
                  ? ((analytics.totalCommissions / analytics.totalOrders) / 1000).toFixed(0) 
                  : 0}K
              </div>
              <p className="text-xs text-muted-foreground">Per order</p>
            </CardContent>
          </Card>
        </div>

        {/* Browse Products Section */}
        <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Browse Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {availableProducts
              .filter(p => !affiliateProducts.some(ap => ap.business_product_id === p.id))
              .map(product => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {product.image_url && (
                    <img src={product.image_url} alt={product.name} className="w-full h-32 object-cover" />
                  )}
                  <div className="p-3">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{product.description}</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm">UGX {product.price.toLocaleString()}</span>
                      <span className="text-xs text-primary">{product.commission_rate || 10}% commission</span>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleProductPreview(product)}
                      disabled={shop.tier === 'free' && productsCount >= 15}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Preview & Add
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </Card>

        {/* My Products Section */}
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">My Products</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => document.getElementById('browse-products')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-xs sm:text-sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Add More
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {affiliateProducts.map((affiliateProduct) => {
              const product = availableProducts.find(p => p.id === affiliateProduct.business_product_id);
              if (!product) return null;

              return (
                <Card key={affiliateProduct.id} className="overflow-hidden">
                  {product.image_url && (
                    <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-lg">UGX {product.price.toLocaleString()}</span>
                      <span className="text-sm text-primary">
                        {affiliateProduct.commission_rate}% commission
                      </span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => handleRemoveProduct(affiliateProduct.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {affiliateProducts.length === 0 && (
            <Card className="p-12 text-center">
              <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Products Yet</h3>
              <p className="text-muted-foreground">Add products from sellers to start earning commissions</p>
            </Card>
          )}
        </div>
      </div>

      <ProductPreviewModal
        product={previewProduct}
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewProduct(null);
        }}
        onAdd={handleAddProduct}
      />
    </div>
  );
}
