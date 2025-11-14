import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    shop.checkout_type || 'flamia'
  );
  const [whatsappNumber, setWhatsappNumber] = useState(shop.whatsapp_number || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate WhatsApp number if WhatsApp checkout is enabled
    if ((checkoutType === 'whatsapp' || checkoutType === 'both') && !whatsappNumber) {
      toast.error('Please enter your WhatsApp number to enable WhatsApp checkout.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('seller_shops')
        .update({
          checkout_type: checkoutType,
          whatsapp_number: whatsappNumber || null,
        })
        .eq('id', shop.id);

      if (error) throw error;

      toast.success('Your checkout preferences have been saved.');
      onUpdate();
    } catch (error: any) {
      console.error('Error updating checkout settings:', error);
      toast.error(error.message || 'Failed to update checkout settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout Settings</CardTitle>
        <CardDescription>
          Configure how customers can purchase from your store
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Checkout Type */}
          <div className="space-y-3">
            <Label>Checkout Method</Label>
            <RadioGroup value={checkoutType} onValueChange={(value: any) => setCheckoutType(value)}>
              <div className="flex items-center space-x-2 border rounded-lg p-4">
                <RadioGroupItem value="flamia" id="flamia" />
                <Label htmlFor="flamia" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">Flamia Checkout</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Customers checkout through Flamia's secure payment system. You receive payouts automatically.
                  </p>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-lg p-4">
                <RadioGroupItem value="whatsapp" id="whatsapp" />
                <Label htmlFor="whatsapp" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    <span className="font-medium">WhatsApp Only</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Customers order directly via WhatsApp. You handle payment and delivery yourself.
                  </p>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-lg p-4">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-orange-500" />
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Both Options</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Give customers the choice between Flamia checkout or WhatsApp.
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* WhatsApp Number */}
          {(checkoutType === 'whatsapp' || checkoutType === 'both') && (
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number *</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="+256XXXXXXXXX"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                required={checkoutType === 'whatsapp' || checkoutType === 'both'}
              />
              <p className="text-sm text-muted-foreground">
                Include country code (e.g., +256 for Uganda). WhatsApp orders don't require customer accounts.
              </p>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Checkout Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

