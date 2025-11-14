import { useState, useEffect } from 'react';
import { ShoppingCart, X, Minus, Plus, Trash2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useSellerCart } from '@/contexts/SellerCartContext';
import { Card, CardContent } from '@/components/ui/card';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const SellerCartButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [shopName, setShopName] = useState<string>('');
  const { slug } = useParams<{ slug: string }>();
  const { items, removeFromCart, updateQuantity, getTotalPrice, getItemCount, clearCart } = useSellerCart();
  const itemCount = getItemCount();
  const totalPrice = getTotalPrice();

  useEffect(() => {
    const loadShopDetails = async () => {
      if (!slug) {
        // Try to get from subdomain
        const match = window.location.hostname.match(/^([a-z0-9-]+)\.flamia\.store$/i);
        if (match) {
          const subdomain = match[1];
          const { data } = await supabase
            .from('seller_shops')
            .select('whatsapp_number, shop_name')
            .eq('shop_slug', subdomain)
            .single();
          if (data) {
            setWhatsappNumber(data.whatsapp_number || '');
            setShopName(data.shop_name || '');
          }
        }
      } else {
        const { data } = await supabase
          .from('seller_shops')
          .select('whatsapp_number, shop_name')
          .eq('shop_slug', slug)
          .single();
        if (data) {
          setWhatsappNumber(data.whatsapp_number || '');
          setShopName(data.shop_name || '');
        }
      }
    };
    loadShopDetails();
  }, [slug]);

  const handleCheckout = () => {
    try {
      console.log('Checkout clicked. WhatsApp:', whatsappNumber, 'Items:', items.length);
      
      if (!whatsappNumber) {
        console.error('No WhatsApp number configured');
        toast.error('Shop WhatsApp number not configured. Please contact the shop owner.');
        return;
      }

      if (items.length === 0) {
        console.error('Cart is empty');
        toast.error('Your cart is empty. Add items before checking out.');
        return;
      }

      // Create order message
      let message = `*New Order from ${shopName || 'Store'}*\n\n`;
      message += `*Order Details:*\n`;
      items.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\n`;
        message += `   Quantity: ${item.quantity}\n`;
        message += `   Price: UGX ${item.price.toLocaleString()}\n`;
        message += `   Subtotal: UGX ${(item.price * item.quantity).toLocaleString()}\n\n`;
      });
      message += `*Total: UGX ${totalPrice.toLocaleString()}*\n\n`;
      message += `Please confirm this order and provide delivery details.`;

      // Clean phone number and create WhatsApp URL
      const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
      console.log('Clean WhatsApp number:', cleanNumber);
      
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
      
      console.log('Opening WhatsApp URL:', whatsappUrl);
      
      // Open WhatsApp in new tab
      const newWindow = window.open(whatsappUrl, '_blank');
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        console.warn('Popup blocked, trying direct navigation');
        window.location.href = whatsappUrl;
      }
      
      toast.success('Opening WhatsApp to complete your order!');
      setIsOpen(false);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to open WhatsApp. Please try again.');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl hover:shadow-3xl transition-all z-50 bg-primary hover:bg-primary/90"
        >
          <ShoppingCart className="h-6 w-6" />
          {itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-destructive text-destructive-foreground border-2 border-background">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({itemCount})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground">Add products to get started</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg bg-muted flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                            {item.name}
                          </h4>
                          <p className="text-sm font-bold text-primary mb-2">
                            UGX {item.price.toLocaleString()}
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 ml-auto text-destructive hover:text-destructive"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t px-6 py-4 space-y-4 bg-muted/20">
              <div className="space-y-2">
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">UGX {totalPrice.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">UGX {totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={handleCheckout}
                  disabled={items.length === 0}
                  className="w-full h-12 text-base font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                  type="button"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Order via WhatsApp
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  {whatsappNumber 
                    ? 'Complete your order through WhatsApp' 
                    : 'WhatsApp checkout not configured'}
                </p>
                <Button
                  onClick={clearCart}
                  variant="outline"
                  className="w-full"
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
