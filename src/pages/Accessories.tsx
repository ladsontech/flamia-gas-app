import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Helmet } from "react-helmet";
import { accessories } from "@/components/accessories/AccessoriesData";
import { Flame, Star, Truck, MapPin, Phone, Shield, Zap, Clock } from "lucide-react";

const Accessories = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleOrder = (accessoryId: string) => {
    navigate(`/order?accessory=${accessoryId}`);
  };

  // Enhanced SEO with competitor keywords and all search terms
  const pageTitle = "Gas Accessories Uganda | Gas Regulator, Burner, Pipe | Cheaper than Fumbaa, Jumia & Kweli Shop | Best LPG Accessories Kampala";
  const pageDescription = "Shop best gas accessories in Uganda. Gas regulator, gas burner, gas pipe, cylinder stand. Cheaper than Fumbaa gas accessories, Jumia delivery, Kweli shop. Free delivery in Kampala, Wakiso, Mukono. Gas accessories for Total, Shell, Stabex, Hass gas cylinders.";

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="container mx-auto px-2 py-3">
          <div className="flex items-center justify-center min-h-[200px]">
            <p className="text-center text-muted-foreground">Loading best gas accessories in Uganda...</p>
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
        <meta name="keywords" content="gas accessories Uganda, gas regulator Uganda, gas burner Uganda, gas pipe Uganda, cylinder stand Uganda, LPG accessories Uganda, gas accessories near me, gas regulator near me, gas burner near me, gas pipe near me, gas accessories Kampala, gas accessories Wakiso, gas accessories Mukono, gas accessories Entebbe, Fumbaa gas accessories, Jumia gas accessories, Kweli shop gas accessories, Jiji gas accessories, gas accessories shop near me, gas accessories store near me, gas connection accessories, gas cylinder accessories, cooking gas accessories, LPG gas accessories, propane accessories Uganda, butane gas accessories, gas stove accessories, gas cooker accessories, gas grill accessories, welding gas accessories, gas regulator price Uganda, gas burner price Uganda, gas pipe price Uganda, cylinder stand price Uganda, gas lighter Uganda, gas accessories delivery, gas accessories home delivery, gas accessories online, gas accessories supplier Uganda, gas accessories dealer Uganda, best gas accessories Uganda, cheap gas accessories Uganda, affordable gas accessories Uganda, quality gas accessories Uganda, gas safety accessories, gas accessories for Total gas, gas accessories for Shell gas, gas accessories for Stabex gas, gas accessories for Hass gas, gas accessories for Oryx gas, 2 burner gas stove Uganda, gas cylinder stand Uganda, gas regulator price, gas pipe 2 meters, gas lighter price, 6kg burner Uganda" />
        
        {/* Enhanced Open Graph */}
        <meta property="og:title" content="Gas Accessories Uganda - Better than Fumbaa & Jumia | Flamia" />
        <meta property="og:description" content="Best gas accessories in Uganda. Gas regulator, burner, pipe, cylinder stand. Cheaper than Fumbaa, Jumia, Kweli shop. Free delivery Kampala." />
        <meta property="og:type" content="product" />
        <meta property="og:url" content="https://flamia.store/accessories" />
        <meta property="og:image" content="https://flamia.store/images/regulator.jpeg" />
        <meta property="og:site_name" content="Flamia Gas Accessories - Alternative to Fumbaa" />
        <meta property="og:locale" content="en_UG" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Gas Accessories Uganda - Fumbaa Alternative | Flamia" />
        <meta name="twitter:description" content="Best gas accessories prices in Uganda. Better than Fumbaa gas accessories, Jumia delivery. Free delivery Kampala." />
        <meta name="twitter:image" content="https://flamia.store/images/regulator.jpeg" />

        {/* Enhanced Local Business Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            "name": "Flamia Gas Accessories Store - Better than Fumbaa & Jumia",
            "description": "Best gas accessories store in Uganda. Gas regulator, burner, pipe, cylinder stand. Cheaper than Fumbaa gas accessories, Jumia delivery, Kweli shop.",
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
              "name": "Gas Accessories - Better Prices than Fumbaa & Jumia",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Product",
                    "name": "Gas Regulator Uganda - Universal for All Brands",
                    "description": "Universal gas regulator compatible with Total, Shell, Stabex, Hass gas cylinders. Cheaper than Fumbaa gas accessories."
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Product",
                    "name": "Gas Burner Uganda - 2 Burner Gas Stove",
                    "description": "Efficient 2-burner gas stove for Ugandan kitchens. Better quality than Jumia gas accessories."
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Product",
                    "name": "Gas Pipe Uganda - 2 Meters High Quality",
                    "description": "High-quality gas pipe 2 meters. Durable and leak-proof. Better than Kweli shop gas accessories."
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
            "name": "Gas Accessories Uganda - Regulator, Burner, Pipe - Better than Fumbaa & Jumia",
            "description": "Complete range of gas accessories in Uganda. Gas regulator, gas burner, gas pipe, cylinder stand. Cheaper than Fumbaa gas accessories, Jumia delivery.",
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
        
        <meta name="geo.region" content="UG" />
        <meta name="geo.placename" content="Kampala" />
        <meta name="content-language" content="en" />
        <meta name="rating" content="general" />
        <meta name="revisit-after" content="7 days" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        
        <link rel="canonical" href="https://flamia.store/accessories" />
        <link rel="preload" as="image" href="/images/regulator.jpeg" />
        <link rel="preload" as="image" href="/images/horse_pipe.jpeg" />
        <link rel="preload" as="image" href="/images/2_plate_burner.jpeg" />
      </Helmet>
      
      <div className="container mx-auto px-3 md:px-6 lg:px-8 flex-grow py-6 max-w-7xl">
        {/* Enhanced Hero Section with Competitor Keywords */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
            <Flame className="w-4 h-4" />
            Better than Fumbaa Gas Accessories
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Best Gas Accessories Store in Uganda
            <span className="block text-accent">Cheaper than Fumbaa, Jumia & Kweli Shop</span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-4xl mx-auto mb-6">
            Shop quality gas accessories in Uganda. Gas regulator, gas burner, gas pipe, cylinder stand. 
            Better prices than Fumbaa gas accessories, Jumia delivery, Kweli shop. Free delivery in Kampala, Wakiso, Mukono.
          </p>

          {/* Competitor Comparison for Accessories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
            <div className="flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 text-sm">vs Fumbaa Accessories</h3>
                <p className="text-xs text-gray-600">Better quality & faster delivery</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 text-sm">vs Jumia Accessories</h3>
                <p className="text-xs text-gray-600">Lower prices & free delivery</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 text-sm">vs Kweli Shop</h3>
                <p className="text-xs text-gray-600">Superior service & quality</p>
              </div>
            </div>
          </div>

          {/* Service Areas for Accessories */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-lg mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Gas Accessories Delivery Areas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {[
                "Gas Accessories Kampala",
                "Gas Accessories Wakiso", 
                "Gas Accessories Mukono",
                "Gas Accessories Entebbe"
              ].map((area, index) => (
                <div key={index} className="text-center p-3 bg-accent/5 rounded-lg">
                  <MapPin className="w-4 h-4 text-accent mx-auto mb-1" />
                  <p className="font-medium text-gray-900">{area}</p>
                  <p className="text-xs text-gray-600">Free same-day delivery</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Accessories Grid with SEO */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-900">
            Complete Gas Accessories Collection
            <span className="block text-lg text-accent mt-2">
              Gas Regulator • Gas Burner • Gas Pipe • Cylinder Stand
            </span>
          </h2>
          
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
                        alt={`${accessory.name} - Best gas accessories Uganda - Better than Fumbaa gas accessories`}
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
                    <div className="mb-2">
                      <p className="text-accent font-bold text-sm">
                        UGX {accessory.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600 font-medium">
                        Cheaper than Fumbaa accessories
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <Truck className="w-3 h-3" />
                      <span>Free delivery Kampala</span>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-3 pt-0">
                    <Button
                      onClick={() => handleOrder(accessory.id)}
                      className="w-full bg-accent hover:bg-accent/90 text-white text-xs py-2 h-8 font-semibold transition-all duration-300 group-hover:shadow-lg"
                    >
                      Order {accessory.name}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Enhanced Why Choose Our Accessories Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-lg mb-8">
          <h3 className="text-2xl font-bold text-center mb-6 text-gray-900">
            Why Choose Flamia Gas Accessories Over Competitors?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-accent" />
              </div>
              <h4 className="font-bold text-accent mb-2">vs Fumbaa Gas Accessories</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ Better quality products</li>
                <li>✓ Faster delivery service</li>
                <li>✓ Lower prices guaranteed</li>
                <li>✓ Better customer support</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-bold text-blue-600 mb-2">vs Jumia Gas Accessories</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ Free delivery included</li>
                <li>✓ No hidden charges</li>
                <li>✓ Same-day delivery</li>
                <li>✓ Quality guarantee</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-bold text-green-600 mb-2">vs Kweli Shop Gas</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ Professional installation</li>
                <li>✓ Expert advice included</li>
                <li>✓ Warranty on all products</li>
                <li>✓ After-sales support</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-bold text-purple-600 mb-2">vs Jiji Gas Sellers</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ Verified suppliers only</li>
                <li>✓ Fixed pricing</li>
                <li>✓ Professional service</li>
                <li>✓ Return policy available</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Enhanced Contact Section for Accessories */}
        <div className="bg-gradient-to-r from-accent/10 to-blue-50 rounded-2xl p-6 text-center border border-accent/20">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Need Help Choosing Gas Accessories?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our gas accessories experts will help you choose the right regulator, burner, pipe, or cylinder stand. 
            Better customer service than Fumbaa gas accessories, Jumia delivery, Kweli shop.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
            <Button
              onClick={() => window.open("https://wa.me/256789572007", "_blank")}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-base font-semibold flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              WhatsApp Gas Accessories Expert
            </Button>
            <div className="text-sm text-gray-600">
              <p>+256 789 572 007</p>
              <p>Faster response than Fumbaa customer service</p>
            </div>
          </div>
          
          {/* SEO Keywords Footer for Accessories */}
          <div className="text-xs text-gray-500 max-w-4xl mx-auto leading-relaxed">
            <p className="mb-2">
              <strong>Popular gas accessories:</strong> gas regulator Uganda, gas burner Uganda, gas pipe Uganda, 
              cylinder stand Uganda, gas lighter Uganda, 2 burner gas stove Uganda, 6kg burner Uganda, 
              gas accessories near me, gas accessories Kampala, gas accessories Wakiso
            </p>
            <p>
              <strong>Compatible with:</strong> Total gas cylinder accessories, Shell gas accessories, 
              Stabex gas accessories, Hass gas accessories, Oryx gas accessories, Universal gas regulator, 
              LPG accessories Uganda, cooking gas accessories, propane accessories Uganda
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accessories;