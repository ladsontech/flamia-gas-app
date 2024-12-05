import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface HotDealProps {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  price: string | null;
  onOrder: () => void;
}

const HotDealCard = ({ title, description, imageUrl, price, onOrder }: HotDealProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
        <div className="relative h-24 sm:h-28 md:h-32">
          <img
            src={imageUrl || 'https://images.unsplash.com/photo-1590959651373-a3db0f38a961?q=80&w=3039&auto=format&fit=crop'}
            alt={title}
            className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1590959651373-a3db0f38a961?q=80&w=3039&auto=format&fit=crop';
            }}
          />
          <div className="absolute top-2 right-2">
            <Badge variant="destructive" className="animate-pulse text-[10px] sm:text-xs px-1 py-0">
              Hot Deal!
            </Badge>
          </div>
        </div>
        <div className="p-2 sm:p-3">
          <h3 className="text-xs sm:text-sm font-semibold mb-1">{title}</h3>
          {description && (
            <p className="text-muted-foreground text-[10px] sm:text-xs mb-1 line-clamp-2">{description}</p>
          )}
          {price && (
            <p className="text-destructive font-bold text-xs sm:text-sm mb-2">{price}</p>
          )}
          <Button
            onClick={onOrder}
            className="w-full bg-destructive hover:bg-destructive/90 text-white text-[10px] sm:text-xs py-1 h-auto"
          >
            Claim Deal
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default HotDealCard;