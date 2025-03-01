
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useState } from "react";

interface HotDealProps {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  price: string | null;
  onOrder: () => void;
}

// Static fallback image
const fallbackImage = 'https://images.unsplash.com/photo-1590959651373-a3db0f38a961?q=80&w=800&auto=format&fit=crop';

const HotDealCard = ({ title, description, imageUrl, price, onOrder }: HotDealProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // SEO optimized alt text
  const altText = `${title} - ${description || 'Best gas deal in Uganda with free delivery'}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        <div className="relative w-full aspect-square"> {/* Always 1:1 aspect ratio */}
          {!isImageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={imageError ? fallbackImage : (imageUrl || fallbackImage)}
            alt={altText}
            className={`absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setIsImageLoaded(true);
            }}
            loading="lazy"
            width="400"
            height="400"
          />
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="destructive" className="animate-pulse text-[10px] sm:text-xs px-1 py-0">
              Hot Deal!
            </Badge>
          </div>
        </div>
        <div className="p-2 sm:p-3 flex-grow">
          <h3 className="text-xs sm:text-sm font-semibold mb-1">{title}</h3>
          {description && (
            <p className="text-muted-foreground text-[10px] sm:text-xs mb-1 line-clamp-2">{description}</p>
          )}
          {price && (
            <p className="text-destructive font-bold text-xs sm:text-sm mb-2">{price}</p>
          )}
          <Button
            onClick={onOrder}
            className="w-full bg-destructive hover:bg-destructive/90 text-white text-[10px] sm:text-xs py-1 h-auto mt-auto"
          >
            Claim Deal
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default HotDealCard;
