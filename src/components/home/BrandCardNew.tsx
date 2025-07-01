
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
  originalPrice?: string;
  description?: string;
}

const BrandCardNew = ({ name, brand, image, size, price, originalPrice, description }: BrandCardProps) => {
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
      className="h-full"
    >
      <Card className="group bg-white border-gray-100 shadow-sm hover:shadow-md p-2 sm:p-3 lg:p-2.5 transition-all duration-300 overflow-hidden h-full flex flex-col">
        <div className="relative w-full pb-[100%] mb-2 lg:mb-1.5 rounded-lg overflow-hidden bg-gray-50/80">
          {!isImageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="w-4 h-4 lg:w-3 lg:h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={imageError ? fallbackImage : image}
            alt={`${brand} ${size} gas cylinder for sale in Uganda - ${finalDescription}`}
            className={`absolute inset-0 w-full h-full object-contain p-1.5 lg:p-1 group-hover:scale-110 transition-transform duration-500 ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
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
        <div className="flex-grow">
          <h3 className="text-xs sm:text-sm lg:text-xs font-semibold mb-0.5 lg:mb-0.5 text-gray-900">{brand} Gas</h3>
          <p className="text-xs lg:text-xs font-medium text-accent mb-1 lg:mb-0.5">{size} Cylinder</p>
          <p className="text-muted-foreground mb-2 lg:mb-1.5 text-xs lg:text-xs line-clamp-2">
            {finalDescription}
          </p>
        </div>
        <div className="pt-1.5 lg:pt-1 border-t border-gray-100">
          <div className="flex justify-between items-center mb-1.5 lg:mb-1">
            <span className="text-xs lg:text-xs font-medium text-gray-600">Price</span>
            <div className="flex flex-col items-end">
              {originalPrice && (
                <span className="text-xs text-gray-400 line-through">{originalPrice}</span>
              )}
              <span className="text-xs sm:text-sm lg:text-xs font-semibold text-accent">{price}</span>
            </div>
          </div>
          <Button
            onClick={handleOrder}
            className="w-full bg-accent text-white hover:bg-accent/90 text-xs lg:text-xs py-1.5 lg:py-1 h-7 lg:h-6 rounded-lg"
          >
            Order Now
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default BrandCardNew;
