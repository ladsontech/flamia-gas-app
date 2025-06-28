import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import HeaderSection from "@/components/home/HeaderSection";
import BrandsGrid from "@/components/home/BrandsGrid";
import { Helmet } from "react-helmet";
import ImageCarousel from "@/components/home/ImageCarousel";
import PromotionsSection from "@/components/home/PromotionsSection";
import PopularBrands from "@/components/home/PopularBrands";
import { Sparkles, Zap, Shield, Clock, Star, Truck, MapPin, Phone, Flame } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const features = [
    {
      icon: Zap,
      title: "Faster than Fumbaa Gas",
      desc: "Same-day delivery vs 2-3 days"
    },
    {
      icon: Shield,
      title: "Cheaper than Jumia & Kweli Shop",
      desc: "Best gas cylinder prices guaranteed"
    },
    {
      icon: Clock,
      title: "Better than Jiji Gas Sellers",
      desc: "Professional service & quality guarantee"
    }
  ];

  // Enhanced SEO title and description with ALL competitor keywords
  const pageTitle = "Best Gas Delivery Service Uganda | Cheaper than Fumbaa, Jumia, Kweli Shop & Jiji | Total, Shell, Stabex Gas Cylinders | Free Same-Day Delivery Kampala";
  const pageDescription = "Uganda's #1 gas delivery service. Cheaper than Fumbaa gas, Jumia gas delivery, Kweli shop & Jiji gas sellers. Best prices for Total gas cylinder, Shell gas delivery, Stabex gas prices, Hass gas refill. Free same-day cooking gas delivery in Kampala, Wakiso, Mukono, Entebbe. Alternative to Fumbaa gas app with better service.";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="best gas delivery service Uganda, Fumbaa gas alternative, Jumia gas delivery alternative, Kweli shop gas prices, Jiji gas sellers Uganda, Total gas cylinder prices Uganda, Shell gas delivery near me, Stabex gas cylinder prices Uganda, Hass gas refill, cooking gas delivery near me, gas delivery service near me, free gas delivery, same day gas delivery, best cooking gas Uganda, gas cylinder delivery, LPG gas delivery, cooking gas supplier near me, gas refill near me, gas suppliers near me, home gas delivery, online gas delivery, express gas delivery, cheap gas cylinder Uganda, affordable gas delivery, gas delivery Kampala, gas delivery Wakiso, gas delivery Mukono, gas delivery Entebbe, cooking gas home delivery, gas home delivery, gas cylinder order online, gas dealer near me, gas dealers near me, gas shop near me, gas store near me, gas connection near me, gas express Uganda, easy gas Uganda, safe gas Uganda, ultimate gas Uganda, C gas Uganda, Nova gas Uganda, gas accessories Uganda, gas burner Uganda, gas regulator Uganda, propane sales near me, LPG dealers near me, butane gas Uganda, welding gas Uganda, emergency gas Uganda, gas for cooking near me, gas for sale Uganda, cylinder gas Uganda, cylinder refill Uganda, gas cylinder refill near me, refilling gas cylinder, refilling gas cylinders, gas refilling service, gas refill service Uganda, cooking gas refill near me, easy gas refill near me, safe gas refill near me, gas cylinder shops near me, cooking gas delivery service near me, gas delivery services Uganda, delivery gas Uganda, lowest gas prices Uganda, cheap LPG gas Uganda, what is the best gas Uganda, best gas cylinder Uganda, best gas cylinder in Uganda, price of gas cylinder Uganda, how much is refilling gas Uganda, gas total price Uganda, Total gas 6kg price Uganda, Stabex gas 12kg price Uganda, Shell gas cylinder price near me, Total LPG gas delivery, Total gas delivery, Total gas delivery near me, Total gas delivery app, Shell cooking gas delivery near me, gas cylinder in Uganda, gas cylinders Uganda, gas cylinders near me, lake gas Uganda" />
        
        {/* Enhanced Open Graph with competitor mentions */}
        <meta property="og:title" content="Best Gas Delivery Uganda - Better than Fumbaa, Jumia & Kweli Shop | Flamia" />
        <meta property="og:description" content="Uganda's #1 gas delivery service. Faster than Fumbaa gas, cheaper than Jumia delivery, better than Kweli shop. Total, Shell, Stabex gas cylinders with free same-day delivery." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://flamia.store/" />
        <meta property="og:image" content="https://flamia.store/images/total 6KG.png" />
        <meta property="og:site_name" content="Flamia Gas Delivery - Alternative to Fumbaa Gas" />
        <meta property="og:locale" content="en_UG" />
        
        {/* Twitter Card with competitor keywords */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Best Gas Delivery Uganda - Fumbaa Alternative | Flamia" />
        <meta name="twitter:description" content="Better than Fumbaa gas, cheaper than Jumia delivery. Best gas cylinder prices in Uganda with free same-day delivery." />
        <meta name="twitter:image" content="https://flamia.store/images/total 6KG.png" />

        {/* Enhanced Local Business Schema with competitor mentions */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Flamia Gas Delivery - Best Alternative to Fumbaa, Jumia & Kweli Shop",
            "alternateName": ["Best Gas Delivery Uganda", "Fumbaa Gas Alternative", "Jumia Gas Alternative", "Kweli Shop Alternative"],
            "description": "Uganda's best gas delivery service. Faster than Fumbaa gas, cheaper than Jumia delivery, better service than Kweli shop. Total, Shell, Stabex gas cylinders with free same-day delivery.",
            "url": "https://flamia.store",
            "telephone": "+256789572007",
            "email": "info@flamia.store",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "UG",
              "addressRegion": "Kampala",
              "addressLocality": "Kampala"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "0.347596",
              "longitude": "32.582520"
            },
            "areaServed": [
              "Kampala", "Wakiso", "Mukono", "Entebbe", "Jinja", "Masaka"
            ],
            "serviceType": [
              "Gas Cylinder Delivery", "LPG Gas Delivery", "Cooking Gas Delivery", 
              "Gas Refill Service", "Gas Accessories Delivery", "Same Day Gas Delivery"
            ],
            "priceRange": "UGX 25,000 - UGX 350,000",
            "openingHours": [
              "Mo-Fr 07:30-22:00",
              "Sa 08:00-21:00", 
              "Su 09:00-21:00"
            ],
            "paymentAccepted": ["Cash", "Mobile Money", "Bank Transfer"],
            "currenciesAccepted": "UGX",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Gas Products and Services - Better than Fumbaa & Jumia",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Product",
                    "name": "Total Gas Cylinder Delivery - Cheaper than Fumbaa",
                    "description": "Total gas cylinders 6kg & 12kg with free delivery. Better prices than Fumbaa gas and Jumia delivery."
                  }
                },
                {
                  "@type": "Offer", 
                  "itemOffered": {
                    "@type": "Product",
                    "name": "Shell Gas Delivery Service - Alternative to Kweli Shop",
                    "description": "Shell gas cylinders with same-day delivery. Better service than Kweli shop and Jiji sellers."
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Product", 
                    "name": "Stabex Gas Refill - Best Prices vs Competitors",
                    "description": "Stabex gas refill service with guaranteed best prices. Cheaper than all competitors including Fumbaa and Jumia."
                  }
                }
              ]
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "500",
              "bestRating": "5",
              "worstRating": "1"
            }
          })}
        </script>

        {/* Product Schema for Gas Cylinders */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Gas Cylinders Uganda - Total, Shell, Stabex - Better than Fumbaa & Jumia",
            "description": "Best gas cylinder prices in Uganda. Total gas cylinder, Shell gas delivery, Stabex gas refill. Cheaper than Fumbaa gas, Jumia delivery, Kweli shop.",
            "brand": [
              {"@type": "Brand", "name": "Total Gas"},
              {"@type": "Brand", "name": "Shell Gas"},
              {"@type": "Brand", "name": "Stabex Gas"},
              {"@type": "Brand", "name": "Hass Gas"},
              {"@type": "Brand", "name": "Oryx Gas"}
            ],
            "offers": {
              "@type": "AggregateOffer",
              "lowPrice": "25000",
              "highPrice": "350000", 
              "priceCurrency": "UGX",
              "availability": "https://schema.org/InStock",
              "seller": {
                "@type": "Organization",
                "name": "Flamia Gas Delivery"
              }
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "500"
            }
          })}
        </script>

        <meta name="geo.region" content="UG" />
        <meta name="geo.placename" content="Kampala" />
        <meta name="geo.position" content="0.347596;32.582520" />
        <meta name="ICBM" content="0.347596, 32.582520" />
        <meta name="content-language" content="en" />
        <meta name="rating" content="general" />
        <meta name="revisit-after" content="1 days" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <meta name="googlebot" content="index, follow" />
        
        <link rel="canonical" href="https://flamia.store/" />
        <link rel="preload" as="image" href="/images/total 6KG.png" />
        <link rel="preload" as="image" href="/images/shell 6KG.png" />
        <link rel="preload" as="image" href="/images/stabex 6KG.png" />
      </Helmet>

      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Sidebar - Desktop Only */}
        <div className="hidden lg:block lg:w-80 xl:w-96 border-r border-gray-100 bg-gray-50 py-6 px-4">
          <div className="sticky top-20 space-y-6">
            {/* Enhanced Featured Section with Competitor Keywords */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-accent p-4">
                <div className="flex items-center gap-2 text-white">
                  <Sparkles size={20} />
                  <h3 className="font-bold text-lg">Better than Fumbaa Gas</h3>
                </div>
                <p className="text-white/90 text-sm mt-1">Faster delivery, better prices</p>
              </div>
              <div className="p-2">
                <ImageCarousel />
              </div>
            </div>

            {/* Enhanced Features with Competitor Comparisons */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Why Choose Flamia Over Competitors?</h3>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="bg-accent/10 p-2 rounded-xl">
                      <feature.icon size={20} className="text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900">{feature.title}</h4>
                      <p className="text-xs text-gray-600">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Contact Section */}
            <div className="bg-accent/10 rounded-2xl p-6 border border-accent/20">
              <div className="text-center">
                <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Phone className="text-accent" size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2">Better Customer Service than Fumbaa</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get instant responses unlike Fumbaa gas app delays. Professional gas experts available 7 days a week.
                </p>
                <Button 
                  className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 rounded-xl shadow-lg"
                  onClick={() => window.open("https://wa.me/256789572007", "_blank")}
                >
                  WhatsApp: +256 789 572 007
                </Button>
                <p className="text-xs text-gray-500 mt-2">Faster response than Fumbaa customer service</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full max-w-6xl mx-auto px-3 md:px-6 lg:px-6">
          <div className="flex flex-col gap-4 md:gap-6 py-4 rounded">
            {/* Enhanced Hero Section with ALL Competitor Keywords */}
            <div className="hidden lg:block bg-gradient-to-r from-accent/10 via-blue-50 to-green-50 rounded-3xl p-8 mb-6 border border-accent/20">
              <div className="text-center max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-bold mb-4">
                  <Star className="w-4 h-4 fill-current" />
                  #1 Alternative to Fumbaa Gas App
                </div>
                
                <h1 className="text-4xl xl:text-6xl font-bold mb-6 text-gray-900 leading-tight">
                  Uganda's Best Gas Delivery Service
                  <span className="block text-accent mt-2">Better than Fumbaa, Jumia & Kweli Shop</span>
                </h1>
                
                <p className="text-xl text-gray-700 mb-6 max-w-4xl mx-auto leading-relaxed">
                  Get Total gas cylinder, Shell gas delivery, Stabex gas refill at best prices. 
                  Faster than Fumbaa gas app, cheaper than Jumia gas delivery, better service than Kweli shop. 
                  Free same-day cooking gas delivery in Kampala, Wakiso, Mukono & Entebbe.
                </p>

                {/* Competitor Comparison Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white/90 p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-accent mb-1">vs Fumbaa Gas</h3>
                    <p className="text-sm text-gray-600">Same-day delivery vs 2-3 days</p>
                  </div>
                  <div className="bg-white/90 p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-accent mb-1">vs Jumia Delivery</h3>
                    <p className="text-sm text-gray-600">Lower prices + free delivery</p>
                  </div>
                  <div className="bg-white/90 p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-accent mb-1">vs Kweli Shop</h3>
                    <p className="text-sm text-gray-600">Better quality + service</p>
                  </div>
                  <div className="bg-white/90 p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-accent mb-1">vs Jiji Sellers</h3>
                    <p className="text-sm text-gray-600">Verified suppliers only</p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  <Button 
                    size="lg" 
                    className="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg"
                    onClick={() => navigate('/order')}
                  >
                    Order Gas Cylinder Now
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-accent text-accent hover:bg-accent/10 px-8 py-4 rounded-xl font-bold text-lg"
                    onClick={() => window.open("https://wa.me/256789572007", "_blank")}
                  >
                    WhatsApp Expert
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden">
              <HeaderSection />
              
              {/* Mobile Competitor Comparison */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm">
                <h2 className="font-bold text-lg text-center mb-3 text-gray-900">
                  Why Choose Flamia Over Other Gas Apps?
                </h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center p-3 bg-accent/5 rounded-lg">
                    <h3 className="font-semibold text-accent">vs Fumbaa Gas</h3>
                    <p className="text-gray-600">Faster delivery</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-600">vs Jumia</h3>
                    <p className="text-gray-600">Better prices</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-600">vs Kweli Shop</h3>
                    <p className="text-gray-600">Superior service</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-600">vs Jiji</h3>
                    <p className="text-gray-600">Quality guarantee</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile/Tablet Components */}
            <div className="lg:hidden">
              <ImageCarousel />
              <PromotionsSection />
              <PopularBrands />
            </div>

            {/* Enhanced Gas Cylinders Section with SEO Keywords */}
            <section className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
                  <Flame className="w-4 h-4" />
                  Total, Shell, Stabex, Hass Gas Cylinders Available
                </div>
                
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
                  Best Gas Cylinder Prices in Uganda
                  <span className="block text-accent text-lg md:text-xl mt-2">
                    Total Gas Cylinder • Shell Gas Delivery • Stabex Gas Refill
                  </span>
                </h2>
                
                <p className="text-base md:text-lg text-gray-600 mb-6 max-w-4xl mx-auto">
                  Get the best cooking gas cylinder prices in Uganda. Total gas cylinder delivery, Shell gas refill service, 
                  Stabex gas cylinder prices, Hass gas delivery. Cheaper than Fumbaa gas app, Jumia gas delivery, 
                  Kweli shop gas prices. Free same-day LPG delivery across Kampala, Wakiso, Mukono, Entebbe.
                </p>

                {/* Service Areas with Local SEO */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 max-w-4xl mx-auto">
                  {[
                    "Gas Delivery Kampala",
                    "Gas Refill Wakiso", 
                    "Gas Delivery Mukono",
                    "Gas Refill Entebbe"
                  ].map((area, index) => (
                    <div key={index} className="bg-white/80 p-3 rounded-lg border border-gray-200 shadow-sm">
                      <MapPin className="w-4 h-4 text-accent mx-auto mb-1" />
                      <p className="text-sm font-medium text-gray-900">{area}</p>
                      <p className="text-xs text-gray-600">Free delivery</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="max-w-7xl mx-auto">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin h-8 w-8 border-4 border-accent rounded-full border-t-transparent"></div>
                  </div>
                ) : (
                  <BrandsGrid brands={[]} />
                )}
              </div>
            </section>

            {/* Enhanced Mobile Help Section with Competitor Keywords */}
            <div className="py-4 md:hidden">
              <div className="bg-gradient-to-r from-accent/20 via-blue-50 to-green-50 rounded-xl p-4 text-center border border-accent/20">
                <h3 className="text-lg font-bold mb-2 text-gray-900">
                  Better Customer Service than Fumbaa Gas App
                </h3>
                <p className="mb-3 text-sm text-gray-700">
                  Get instant expert advice on Total gas cylinder, Shell gas delivery, Stabex gas refill. 
                  Faster response than Fumbaa customer service, better than Jumia support.
                </p>
                <Button 
                  className="bg-accent hover:bg-accent/90 text-white py-3 px-6 rounded-lg font-semibold mb-2"
                  onClick={() => window.open("https://wa.me/256789572007", "_blank")}
                >
                  WhatsApp Gas Expert: +256 789 572 007
                </Button>
                <p className="text-xs text-gray-600">Available 7:30 AM - 10:00 PM • Faster than Fumbaa response time</p>
              </div>
            </div>

            {/* Enhanced SEO Footer Section */}
            <div className="bg-gray-50 rounded-2xl p-6 mt-8">
              <h3 className="text-xl font-bold text-center mb-4 text-gray-900">
                Complete Gas Delivery Service in Uganda
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700">
                <div>
                  <h4 className="font-semibold mb-2 text-accent">Gas Brands Available</h4>
                  <p>Total gas cylinder prices Uganda, Shell gas delivery near me, Stabex gas cylinder prices Uganda, 
                  Hass gas refill, Oryx gas delivery, Ultimate gas Uganda, C gas Uganda, Nova gas Uganda, Safe gas Uganda</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-accent">Service Areas</h4>
                  <p>Gas delivery Kampala, cooking gas delivery near me, gas refill near me, home gas delivery near me, 
                  gas suppliers near me, gas dealer near me, gas shop near me, gas connection near me</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-accent">Why Choose Us</h4>
                  <p>Better than Fumbaa gas app, cheaper than Jumia gas delivery, superior to Kweli shop gas prices, 
                  more reliable than Jiji gas sellers. Best cooking gas in Uganda with free delivery.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}