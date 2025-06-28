import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Helmet } from "react-helmet";
import { accessories } from "@/components/accessories/AccessoriesData";
import { Flame, Truck } from "lucide-react";

const Accessories = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleOrder = (accessoryId: string) => {
    navigate(`/order?accessory=${accessoryId}`);
  };

  // SEO metadata hidden in Helmet
  const pageTitle = "Gas Accessories - Flamia";
  const pageDescription = "Shop for gas accessories including regulators, pipes, stoves, and more. Free delivery in Kampala.";

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="container mx-auto px-2 py-3">
          <div className="flex items-center justify-center min-h-[200px]">
            <p className="text-center text-muted-foreground">Loading accessories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="gas accessories, gas regulator, gas pipe, gas stove, cylinder stand, LPG accessories" />
        
        <meta name="geo.region" content="UG" />
        <meta name="geo.placename" content="Kampala" />
        <meta name="og:locale" content="en_UG" />
        <meta name="og:type" content="product" />
        <meta name="og:title" content="Gas Accessories & Equipment - Flamia Uganda" />
        <meta name="og:description" content="Shop quality gas accessories with free delivery in Kampala. Gas regulators, pipes, burners, stoves, and more at best prices." />
        <meta name="og:url" content="https://flamia.store/accessories" />
        <meta name="og:site_name" content="Flamia Gas Delivery" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Gas Accessories & Equipment - Flamia Uganda" />
        <meta name="twitter:description" content="Shop quality gas accessories with free delivery in Kampala. Regulators, pipes, burners, stoves at best prices." />
        
        <meta name="content-language" content="en" />
        <meta name="rating" content="general" />
        <meta name="revisit-after" content="7 days" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        <link rel="preload" as="image" href="/images/regulator.jpeg" />
        <link rel="preload" as="image" href="/images/horse_pipe.jpeg" />
        
        {/* Hidden SEO-focused structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            "name": "Flamia Gas Accessories Store",
            "description": "Best gas accessories store in Uganda. Gas regulator, burner, pipe, cylinder stand. Free delivery in Kampala.",
            "url": "https://flamia.store/accessories",
            "telephone": "+256789572007",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "UG",
              "addressRegion": "Kampala"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "0.347596",
              "longitude": "32.582520"
            },
            "areaServed": ["Kampala", "Wakiso", "Mukono", "Entebbe"],
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Gas Accessories",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Product",
                    "name": "Gas Regulator Uganda",
                    "description": "Universal gas regulator compatible with Total, Shell, Stabex, Hass gas cylinders."
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Product",
                    "name": "Gas Burner Uganda",
                    "description": "Efficient 2-burner gas stove for Ugandan kitchens."
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Product",
                    "name": "Gas Pipe Uganda",
                    "description": "High-quality gas pipe 2 meters. Durable and leak-proof."
                  }
                }
              ]
            }
          })}
        </script>

        {/* Product Schema for Gas Accessories */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Gas Accessories Uganda - Regulator, Burner, Pipe",
            "description": "Complete range of gas accessories in Uganda. Gas regulator, gas burner, gas pipe, cylinder stand.",
            "category": "Gas Accessories",
            "offers": {
              "@type": "AggregateOffer",
              "lowPrice": "15000",
              "highPrice": "150000",
              "priceCurrency": "UGX",
              "availability": "https://schema.org/InStock"
            }
          })}
        </script>
      </Helmet>
      
      <div className="container mx-auto px-3 md:px-6 lg:px-8 flex-grow py-6 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
            <Flame className="w-4 h-4" />
            Quality Gas Accessories
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Gas Accessories Store
          </h1>
          
          <p className="text-lg text-gray-600 max-w-4xl mx-auto mb-6">
            Shop quality gas accessories in Uganda. Gas regulator, gas burner, gas pipe, cylinder stand. 
            Free delivery in Kampala, Wakiso, Mukono.
          </p>
        </div>

        {/* Accessories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {accessories.map((accessory, index) => (
            <motion.div
              key={accessory.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full"
            >
              <Card className="bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col group hover:-translate-y-1">
                <CardHeader className="p-3">
                  <div className="relative w-full pb-[100%] mb-2 rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={accessory.image_url || '/images/accessory-fallback.jpg'}
                      alt={accessory.name}
                      loading="lazy"
                      width="200"
                      height="200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/accessory-fallback.jpg';
                      }}
                      className="absolute inset-0 w-full h-full group-hover:scale-110 transition-transform duration-500 object-contain p-2"
                    />
                  </div>
                  <CardTitle className="text-sm font-semibold text-gray-900 line-clamp-2">
                    {accessory.name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-3 pt-0 flex-grow">
                  <p className="text-xs text-gray-600 mb-2 line-clamp-3">
                    {accessory.description}
                  </p>
                  <p className="text-accent font-bold text-sm mb-2">
                    UGX {accessory.price.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Truck className="w-3 h-3" />
                    <span>Free delivery Kampala</span>
                  </div>
                </CardContent>
                
                <CardFooter className="p-3 pt-0">
                  <Button
                    onClick={() => handleOrder(accessory.id)}
                    className="w-full bg-accent hover:bg-accent/90 text-white text-xs py-2 h-8 font-semibold transition-all duration-300 group-hover:shadow-lg"
                  >
                    Order Now
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-accent/10 to-blue-50 rounded-2xl p-6 text-center border border-accent/20 mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Need Help Choosing Gas Accessories?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our gas accessories experts will help you choose the right regulator, burner, pipe, or cylinder stand.
          </p>
          <Button
            onClick={() => window.open("https://wa.me/256789572007", "_blank")}
            className="bg-accent hover:bg-accent/90 text-white px-8 py-3 text-base font-semibold"
          >
            Contact Gas Expert
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Accessories;