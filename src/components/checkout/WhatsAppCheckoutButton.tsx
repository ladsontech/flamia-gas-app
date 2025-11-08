import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppCheckoutButtonProps {
  productId: string;
  productName: string;
  productPrice: number;
  quantity?: number;
  whatsappNumber: string;
  shopId: string;
  shopName: string;
  productImage?: string;
  className?: string;
}

export const WhatsAppCheckoutButton = ({
  productId,
  productName,
  productPrice,
  quantity = 1,
  whatsappNumber,
  shopId,
  shopName,
  productImage,
  className = '',
}: WhatsAppCheckoutButtonProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleWhatsAppCheckout = async () => {
    setLoading(true);
    try {
      const total = productPrice * quantity;
      const formattedPrice = `UGX ${total.toLocaleString()}`;
      
      // Track the WhatsApp order in database
      // Create order record
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          description: `WhatsApp Order: ${productName} (${quantity}x)`,
          status: 'pending',
          total_amount: total,
          seller_shop_id: shopId,
          checkout_method: 'whatsapp',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create seller_order record for tracking
      const { error: sellerOrderError } = await supabase
        .from('seller_orders')
        .insert({
          seller_shop_id: shopId,
          order_id: orderData.id,
          business_product_id: productId,
          quantity: quantity,
          unit_price: productPrice,
          total_price: total,
          status: 'pending',
          whatsapp_order_data: {
            message: `${productName} (${quantity}x)`,
            timestamp: new Date().toISOString(),
          },
        });

      if (sellerOrderError) throw sellerOrderError;

      // Clean phone number (remove spaces, dashes, etc.)
      const cleanNumber = whatsappNumber.replace(/[\s\-\(\)]/g, '');
      
      // Create WhatsApp message
      const message = `Hi ${shopName}, I'd like to order:

📦 Product: ${productName}
🔢 Quantity: ${quantity}
💰 Total: ${formattedPrice}

Order ID: ${orderData.id.slice(0, 8)}

Please confirm availability and delivery details.`;

      // Encode message for URL
      const encodedMessage = encodeURIComponent(message);
      
      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');

      toast({
        title: 'Order tracked',
        description: 'Your WhatsApp order has been recorded. Complete the order via WhatsApp.',
      });
    } catch (error: any) {
      console.error('Error tracking WhatsApp order:', error);
      toast({
        title: 'Tracking failed',
        description: 'Could not track order, but you can still proceed via WhatsApp.',
        variant: 'destructive',
      });
      
      // Still allow user to proceed with WhatsApp even if tracking fails
      const total = productPrice * quantity;
      const formattedPrice = `UGX ${total.toLocaleString()}`;
      const cleanNumber = whatsappNumber.replace(/[\s\-\(\)]/g, '');
      const message = `Hi ${shopName}, I'd like to order:\n\n📦 Product: ${productName}\n🔢 Quantity: ${quantity}\n💰 Total: ${formattedPrice}\n\nPlease confirm availability and delivery details.`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleWhatsAppCheckout}
      disabled={loading}
      className={`bg-green-500 hover:bg-green-600 text-white ${className}`}
      size="lg"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 animate-spin" />
      ) : (
        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
      )}
      Order via WhatsApp
    </Button>
  );
};

