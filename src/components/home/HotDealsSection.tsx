
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import HotDealCard from "./HotDealCard";
import { HotDeal } from "@/hooks/useHomeData";

interface HotDealsSectionProps {
  hotDeals: HotDeal[];
}

const HotDealsSection = ({ hotDeals }: HotDealsSectionProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-6 md:mt-8"
    >
      <div className="text-center mb-3 md:mb-6">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-1">
          Special Offers
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Limited time deals on gas cylinders and accessories
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        {hotDeals.map((deal) => (
          <HotDealCard
            key={deal.id}
            {...deal}
            imageUrl={deal.image_url}
            onOrder={() => navigate('/order')}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default HotDealsSection;
