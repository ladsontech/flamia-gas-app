import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShopImageUpload } from '@/components/shop/ShopImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Trash2, Save, LayoutGrid, LayoutList } from 'lucide-react';
import type { AffiliateShop } from '@/types/affiliate';

interface AffiliateShopSettingsProps {
  shop: AffiliateShop;
  onUpdate: () => void;
}

export const AffiliateShopSettings = ({ shop, onUpdate }: AffiliateShopSettingsProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [shopName, setShopName] = useState(shop.shop_name);
  const [shopDescription, setShopDescription] = useState(shop.shop_description || '');
  const [shopLogoUrl, setShopLogoUrl] = useState(shop.shop_logo_url || '');
  const [mobileGridLayout, setMobileGridLayout] = useState<'single' | 'double'>('double');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('affiliate_shops')
        .update({
          shop_name: shopName,
          shop_description: shopDescription || null,
          shop_logo_url: shopLogoUrl || null,
        })
        .eq('id', shop.id);

      if (error) throw error;

      toast.success('Shop settings updated successfully!');
      onUpdate();
    } catch (error: any) {
      console.error('Error updating shop:', error);
      toast.error('Failed to update shop settings');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      // Delete affiliate shop products first
      const { error: productsError } = await supabase
        .from('affiliate_shop_products')
        .delete()
        .eq('affiliate_shop_id', shop.id);

      if (productsError) throw productsError;

      // Delete the shop
      const { error } = await supabase
        .from('affiliate_shops')
        .delete()
        .eq('id', shop.id);

      if (error) throw error;

      toast.success('Shop deleted successfully');
      window.location.href = '/affiliate/dashboard';
    } catch (error: any) {
      console.error('Error deleting shop:', error);
      toast.error('Failed to delete shop');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Shop Information</CardTitle>
          <CardDescription className="text-sm">Update your shop details and appearance</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="shop_name">Shop Name</Label>
              <Input
                id="shop_name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="shop_description">Shop Description</Label>
              <Textarea
                id="shop_description"
                value={shopDescription}
                onChange={(e) => setShopDescription(e.target.value)}
                rows={4}
                placeholder="Tell customers about your shop..."
              />
            </div>

            <ShopImageUpload
              bucket="shop-logos"
              onUploadComplete={setShopLogoUrl}
              currentImage={shopLogoUrl}
              title="Shop Logo"
            />

            <div>
              <Label>Mobile Product Grid Layout</Label>
              <RadioGroup value={mobileGridLayout} onValueChange={(value) => setMobileGridLayout(value as 'single' | 'double')} className="mt-2">
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single" className="flex items-center gap-2 cursor-pointer flex-1">
                    <LayoutList className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Single Column</p>
                      <p className="text-xs text-muted-foreground">One product per row on mobile</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="double" id="double" />
                  <Label htmlFor="double" className="flex items-center gap-2 cursor-pointer flex-1">
                    <LayoutGrid className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Double Column</p>
                      <p className="text-xs text-muted-foreground">Two products per row on mobile</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" disabled={isUpdating} className="flex-1">
                {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl text-destructive">Danger Zone</CardTitle>
          <CardDescription className="text-sm">Permanently delete your shop and all its data</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Shop
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm">
                  This action cannot be undone. This will permanently delete your affiliate shop,
                  remove all products, and delete all commission data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full sm:w-auto bg-destructive hover:bg-destructive/90"
                >
                  {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Delete Permanently
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};
