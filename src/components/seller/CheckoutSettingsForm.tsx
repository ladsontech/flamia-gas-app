import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { SellerShop } from '@/types/seller';
import { MessageCircle, ShoppingCart, Loader2 } from 'lucide-react';

interface CheckoutSettingsFormProps {
  shop: SellerShop;
  onUpdate: () => void;
}

export const CheckoutSettingsForm = ({ shop, onUpdate }: CheckoutSettingsFormProps) => {
  const [loading, setLoading] = useState(false);
  const [checkoutType, setCheckoutType] = useState<'flamia' | 'whatsapp' | 'both'>(
    shop.checkout_type || 'whatsapp'
  );
  const [whatsappNumber, setWhatsappNumber] = useState(shop.whatsapp_number || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Submitting checkout settings...', {
      shopId: shop.id,
      whatsappNumber,
      checkoutType
    });
    
    // Validate WhatsApp number (required for now)
    if (!whatsappNumber || !whatsappNumber.trim()) {
      toast.error('Please enter your WhatsApp number.');
      return;
    }

    setLoading(true);
    try {
      console.log('Updating seller_shops table...');
      const { data, error } = await supabase
        .from('seller_shops')
        .update({
          checkout_type: 'whatsapp', // Force WhatsApp for now
          whatsapp_number: whatsappNumber.trim(),
        })
        .eq('id', shop.id)
        .select();

      console.log('Update result:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('WhatsApp number saved successfully');
      toast.success('Your WhatsApp number has been saved successfully!');
      onUpdate();
    } catch (error: any) {
      console.error('Error updating checkout settings:', error);
      toast.error(error.message || 'Failed to update checkout settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Checkout Type */}
          <div className="space-y-3">
            <Label>Checkout Method</Label>
            <RadioGroup value={checkoutType} onValueChange={(value: any) => setCheckoutType(value)}>
              <div className="flex items-center space-x-2 border rounded-lg p-4 opacity-50 bg-muted/30 relative">
                <RadioGroupItem value="flamia" id="flamia" disabled />
                <Label htmlFor="flamia" className="flex-1">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">Flamia Checkout</span>
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Coming Soon</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Secure payment system with automatic payouts. Launching soon!
                  </p>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-lg p-4 border-primary/50 bg-primary/5">
                <RadioGroupItem value="whatsapp" id="whatsapp" />
                <Label htmlFor="whatsapp" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    <span className="font-medium">WhatsApp Checkout</span>
                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Customers order directly via WhatsApp. You handle payment and delivery yourself.
                  </p>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-lg p-4 opacity-50 bg-muted/30">
                <RadioGroupItem value="both" id="both" disabled />
                <Label htmlFor="both" className="flex-1">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-orange-500" />
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Both Options</span>
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Coming Soon</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Will be available when Flamia Pay launches.
                  </p>
                </Label>
              </div>
            </RadioGroup>
            <p className="text-sm text-muted-foreground p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              ℹ️ <strong>Flamia Pay is coming soon!</strong> For now, all orders will be processed through WhatsApp. You'll be notified when Flamia Pay launches.
            </p>
          </div>

          {/* WhatsApp Number */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp Number *</Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="+256XXXXXXXXX"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground">
              Include country code (e.g., +256 for Uganda). Customers will contact you directly via WhatsApp to complete their orders.
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Checkout Settings
          </Button>
        </form>
  );
};

