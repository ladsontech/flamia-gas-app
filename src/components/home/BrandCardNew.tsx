
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
      case '3kg':
        return `${brand} ${size} gas cylinder - Perfect for small households or portable use in Uganda. Best prices with free delivery in Kampala and surrounding areas.`;
      case '6kg':
        return `${brand} ${size} gas cylinder - Ideal for medium-sized families in Uganda. Affordable cooking gas delivered to your doorstep in Kampala, Wakiso, Mukono.`;
      case '12kg':
        return `${brand} ${size} gas cylinder - Best value for large families or commercial use in Uganda. Fastest LPG delivery service in Kampala and surrounding areas.`;
      default:
        return `${brand} high-quality gas cylinder available for same-day delivery in Uganda. Affordable LPG prices with free delivery.`;
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
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Residents of Uganda looking for affordable cooking gas"
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white shadow-lg p-2 sm:p-3 hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-50 mb-2">
          {!isImageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin"></div>
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
        <h3 className="text-sm sm:text-base font-semibold mb-1">{brand} Gas</h3>
        <p className="text-xs sm:text-sm font-medium text-accent mb-1">{size} Cylinder</p>
        <p className="text-muted-foreground mb-2 text-xs sm:text-sm line-clamp-2">
          {finalDescription}
        </p>
        <div className="space-y-1 mb-2">
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm font-medium">Price</span>
            <span className="text-xs sm:text-sm font-semibold text-accent">{price}</span>
          </div>
        </div>
        <Button
          onClick={handleOrder}
          className="w-full bg-accent text-white hover:bg-accent/90 text-xs py-1 h-auto mt-auto"
        >
          Order Now
        </Button>
      </Card>
    </motion.div>
  );
};

export default BrandCardNew;
