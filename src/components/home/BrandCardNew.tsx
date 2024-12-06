import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface BrandCardProps {
  name: string;
  image: string;
  prices: {
    '6kg': string;
    '12kg': string;
  };
}

const BrandCardNew = ({ name, image, prices }: BrandCardProps) => {
  const navigate = useNavigate();

  const handleOrder = () => {
    navigate(`/order?brand=${name}`);
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
            alt={name}
            className="w-full h-full object-contain transition-transform duration-300 hover:scale-110"
          />
        </div>
        <h3 className="text-sm sm:text-base font-semibold mb-1">{name}</h3>
        <p className="text-muted-foreground mb-2 text-xs sm:text-sm">
          Brand new, comes with gas and accessories
        </p>
        <div className="space-y-1 mb-2">
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm font-medium">6KG</span>
            <span className="text-xs sm:text-sm font-semibold text-accent">{prices['6kg']}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm font-medium">12KG</span>
            <span className="text-xs sm:text-sm font-semibold text-accent">{prices['12kg']}</span>
          </div>
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