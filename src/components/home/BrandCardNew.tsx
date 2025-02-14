
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
}

const BrandCardNew = ({ name, brand, image, size, price }: BrandCardProps) => {
  const navigate = useNavigate();

  const handleOrder = () => {
    navigate(`/order?brand=${brand}&name=${name}&size=${size}&price=${price}`);
  };

  const getDescription = (size: string) => {
    switch (size) {
      case '3kg':
        return `${brand} ${size} gas cylinder - Perfect for small households or portable use in Uganda`;
      case '6kg':
        return `${brand} ${size} gas cylinder - Ideal for medium-sized families in Uganda`;
      case '12kg':
        return `${brand} ${size} gas cylinder - Best value for large families or commercial use in Uganda`;
      default:
        return `${brand} high-quality gas cylinder available for delivery in Uganda`;
    }
  };

  // Structured data for the product
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${brand} ${size} Gas Cylinder`,
    "description": getDescription(size),
    "brand": {
      "@type": "Brand",
      "name": brand
    },
    "offers": {
      "@type": "Offer",
      "price": price.replace(/[^0-9]/g, ''),
      "priceCurrency": "UGX",
      "availability": "https://schema.org/InStock",
      "areaServed": "Uganda"
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white shadow-lg p-2 sm:p-3 hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <div className="relative h-24 sm:h-28 md:h-32 mb-2 rounded-md overflow-hidden">
          <img
            src={image}
            alt={`${brand} ${size} gas cylinder for sale and delivery in Uganda - ${getDescription(size)}`}
            className="w-full h-full object-contain transition-transform duration-300 hover:scale-110"
            loading="lazy"
          />
        </div>
        <h3 className="text-sm sm:text-base font-semibold mb-1">{brand}</h3>
        <p className="text-xs sm:text-sm font-medium text-accent mb-1">{size} Cylinder</p>
        <p className="text-muted-foreground mb-2 text-xs sm:text-sm line-clamp-2">
          {getDescription(size)}
        </p>
        <div className="space-y-1 mb-2">
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm font-medium">Price</span>
            <span className="text-xs sm:text-sm font-semibold text-accent">{price}</span>
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
