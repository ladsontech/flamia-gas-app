import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface BrandCardProps {
  name: string;
  brand: string;
  image: string;
  size: string;
  price: string;
  refillPrice?: string;
}

const BrandCardNew = ({ name, brand, image, size, price, refillPrice }: BrandCardProps) => {
  const navigate = useNavigate();

  const handleOrder = () => {
    navigate(`/order?brand=${brand}&name=${name}&size=${size}&price=${price}`);
  };

  const getDescription = (size: string) => {
    switch (size) {
      case '3kg':
        return 'Perfect for small households or portable use';
      case '6kg':
        return 'Ideal for medium-sized families';
      case '12kg':
        return 'Best value for large families or commercial use';
      default:
        return 'High-quality gas cylinder';
    }
  };

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
            alt={`${brand} ${size}`}
            className="w-full h-full object-contain transition-transform duration-300 hover:scale-110"
          />
        </div>
        <h3 className="text-sm sm:text-base font-semibold mb-1">{brand}</h3>
        <p className="text-xs sm:text-sm font-medium text-accent mb-1">{size} Cylinder</p>
        <p className="text-muted-foreground mb-2 text-xs sm:text-sm line-clamp-2">
          {getDescription(size)}
        </p>
        <div className="space-y-1 mb-2">
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm font-medium">New</span>
            <span className="text-xs sm:text-sm font-semibold text-accent">{price}</span>
          </div>
          {refillPrice && (
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-medium">Refill</span>
              <span className="text-xs sm:text-sm font-semibold text-green-600">{refillPrice}</span>
            </div>
          )}
        </div>
        <Button
          onClick={handleOrder}
          className="w-full bg-accent text-white hover:bg-accent/90 text-xs py-1 h-auto"
        >
          Order Now
        </Button>
      </Card>
    </motion.div>
  );
};

export default BrandCardNew;