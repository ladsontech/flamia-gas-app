import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface WhatsAppCheckoutButtonProps {
  productName: string;
  productPrice: number;
  quantity?: number;
  whatsappNumber: string;
  shopName: string;
  productImage?: string;
  className?: string;
}

export const WhatsAppCheckoutButton = ({
  productName,
  productPrice,
  quantity = 1,
  whatsappNumber,
  shopName,
  productImage,
  className = '',
}: WhatsAppCheckoutButtonProps) => {
  const handleWhatsAppCheckout = () => {
    const total = productPrice * quantity;
    const formattedPrice = `UGX ${total.toLocaleString()}`;
    
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanNumber = whatsappNumber.replace(/[\s\-\(\)]/g, '');
    
    // Create WhatsApp message
    const message = `Hi ${shopName}, I'd like to order:

📦 Product: ${productName}
🔢 Quantity: ${quantity}
💰 Total: ${formattedPrice}

Please confirm availability and delivery details.`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      onClick={handleWhatsAppCheckout}
      className={`bg-green-500 hover:bg-green-600 text-white ${className}`}
      size="lg"
    >
      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
      Order via WhatsApp
    </Button>
  );
};

