
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface BrandCardProps {
  name: string;
  brand: string;
  image: string;
  size: string;
  price: string;
  description?: string;
}

const BrandCardNew = ({ name, brand, image, size, price, description }: BrandCardProps) => {
  const navigate = useNavigate();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Default fallback image (local)
  const fallbackImage = '/images/gas-fallback.jpg';

  const handleOrder = () => {
    navigate(`/order?brand=${brand}&name=${name}&size=${size}&price=${price}`);
  };

  const getDescription = (brand: string, size: string, customDesc?: string) => {
    if (customDesc) return customDesc;
    
    switch (size) {
      case '6kg':
        return `${brand} ${size} gas cylinder - Ideal for medium-sized families in Uganda.`;
      case '12kg':
        return `${brand} ${size} gas cylinder - Best value for large families or commercial use.`;
      default:
        return `${brand} high-quality gas cylinder available for same-day delivery in Uganda.`;
    }
  };

  const finalDescription = getDescription(brand, size, description);

  // Structured data for the product with additional properties
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${brand} ${size} Gas Cylinder - Best Price in Uganda`,
    "description": finalDescription,
    "brand": {
      "@type": "Brand",
      "name": brand
    },
    "offers": {
      "@type": "Offer",
      "price": price.replace(/[^0-9]/g, ''),
      "priceCurrency": "UGX",
      "availability": "https://schema.org/InStock",
      "areaServed": [
        "Kampala",
        "Wakiso",
        "Mukono",
        "Entebbe",
        "Uganda"
      ],
      "deliveryLeadTime": {
        "@type": "QuantitativeValue",
        "minValue": "30",
        "maxValue": "90",
        "unitCode": "MIN"
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col p-1.5">
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <div className="relative w-full pb-[80%] mb-1.5 rounded-md overflow-hidden bg-gray-50">
          {!isImageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={imageError ? fallbackImage : image}
            alt={`${brand} ${size} gas cylinder for sale in Uganda - ${finalDescription}`}
            className={`absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            width="400"
            height="400"
            onLoad={() => setIsImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setIsImageLoaded(true);
            }}
          />
        </div>
        <h3 className="text-xs font-semibold mb-0.5">{brand} Gas</h3>
        <p className="text-xs font-medium text-accent mb-0.5">{size} Cylinder</p>
        <p className="text-muted-foreground mb-1 text-xs line-clamp-1">
          {finalDescription}
        </p>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium">Price</span>
          <span className="text-xs font-semibold text-accent">{price}</span>
        </div>
        <Button
          onClick={handleOrder}
          className="w-full bg-accent text-white hover:bg-accent/90 text-xs py-0.5 h-6 mt-auto"
        >
          Order Now
        </Button>
      </Card>
    </motion.div>
  );
};

export default BrandCardNew;
