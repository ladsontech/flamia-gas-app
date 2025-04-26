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
      <Card className="group bg-white border-gray-100 shadow-sm hover:shadow-md p-3 sm:p-4 transition-all duration-300 overflow-hidden h-full flex flex-col">
        <div className="relative w-full pb-[100%] mb-3 rounded-lg overflow-hidden bg-gray-50/80">
          {!isImageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={imageError ? fallbackImage : image}
            alt={`${brand} ${size} gas cylinder for sale in Uganda - ${finalDescription}`}
            className={`absolute inset-0 w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500 ${
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
          <h3 className="text-sm sm:text-base font-semibold mb-1 text-gray-900">{brand} Gas</h3>
          <p className="text-xs sm:text-sm font-medium text-accent mb-1.5">{size} Cylinder</p>
          <p className="text-muted-foreground mb-3 text-xs sm:text-sm line-clamp-2">
            {finalDescription}
          </p>
        </div>
        <div className="pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs sm:text-sm font-medium text-gray-600">Price</span>
            <span className="text-sm sm:text-base font-semibold text-accent">{price}</span>
          </div>
          <Button
            onClick={handleOrder}
            className="w-full bg-accent text-white hover:bg-accent/90 text-xs sm:text-sm py-2 h-9 rounded-lg"
          >
            Order Now
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default BrandCardNew;
