import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface Size {
  size: string;
  price: string;
}

interface BrandProps {
  name: string;
  image: string;
  description: string;
  sizes: Size[];
  onOrder: (brand: string, size: string) => void;
}

const BrandCard = ({ name, image, description, sizes, onOrder }: BrandProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white shadow-lg p-2 sm:p-3 hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
        <div className="relative h-24 sm:h-28 md:h-32 mb-2 rounded-md overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain transition-transform duration-300 hover:scale-110"
          />
        </div>
        <h3 className="text-sm sm:text-base font-semibold mb-1">{name}</h3>
        <p className="text-muted-foreground mb-2 text-xs sm:text-sm line-clamp-2">{description}</p>
        <div className="space-y-1 mb-2">
          {sizes.map((size) => (
            <div key={size.size} className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-medium">{size.size}</span>
              <span className="text-xs sm:text-sm font-semibold text-accent">{size.price}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1">
          {sizes.map((size) => (
            <Button
              key={size.size}
              onClick={() => onOrder(name, size.size)}
              variant="outline"
              className="bg-accent text-white hover:bg-accent/90 text-xs py-1 h-auto"
            >
              Order {size.size}
            </Button>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

export default BrandCard;