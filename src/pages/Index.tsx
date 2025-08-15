import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import HeaderSection from "@/components/home/HeaderSection";
import BrandsGrid from "@/components/home/BrandsGrid";
import { Helmet } from "react-helmet";
import ImageCarousel from "@/components/home/ImageCarousel";
import PromotionsSection from "@/components/home/PromotionsSection";
import FeaturedGadgets from "@/components/home/PopularBrands";
import AccessoriesSection from "@/components/home/AccessoriesSection";
import { Sparkles, Zap, Shield, Clock, Star, Truck, MapPin, Phone, Flame } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const features = [{
    icon: Zap,
    title: "Lightning Fast",
    desc: "Same-day delivery"
  }, {
    icon: Shield,
    title: "Guaranteed Quality", 
    desc: "Certified gas suppliers"
  }, {
    icon: Clock,
    title: "24/7 Support",
    desc: "Always here to help"
  }];

  return <>
      <Helmet>
        <title>Flamia - Best Gas Delivery Service in Uganda | Free Same-Day Delivery</title>
        <meta name="description" content="Best gas delivery service in Uganda with free same-day delivery. Order Total, Shell, Oryx, Stabex & Hass gas cylinders at cheapest prices in Kampala, Wakiso & Mukono." />
        <meta name="keywords" content="best gas delivery service in Uganda, fastest gas delivery Kampala, same-day gas cylinder delivery, free gas delivery near me, gas cylinder home delivery, LPG gas delivery service, best gas app Uganda, Total gas delivery, Shell gas delivery, Stabex gas delivery, Hass gas delivery, Oryx gas delivery, Ultimate gas delivery, C gas delivery, alternative to Fumbaa gas" />

        
        <meta name="geo.placename" content="Kampala" />
        <meta name="geo.position" content="0.347596;32.582520" />
        <meta name="ICBM" content="0.347596, 32.582520" />
        <meta name="og:locale" content="en_UG" />
        <meta name="og:type" content="website" />
        <meta name="og:title" content="Flamia - Best Gas Delivery Service in Uganda | Free Same-Day Delivery" />
        <meta name="og:description" content="Best gas delivery service in Uganda with free same-day delivery. Order Total, Shell, Oryx, Stabex & Hass gas at cheapest prices." />
        <meta name="og:url" content="https://flamia.store/" />
        <meta name="og:site_name" content="Flamia Gas Delivery" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Flamia - Best Gas Delivery Service in Uganda | Free Same-Day Delivery" />
        <meta name="twitter:description" content="Fastest gas delivery service in Uganda with free same-day delivery. Better service with lower prices." />

        
        <meta http-equiv="content-language" content="en" />
        <meta name="rating" content="general" />
        <meta name="revisit-after" content="3 days" />
        <meta name="target" content="all" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />

        <meta name="format-detection" content="telephone=yes" />
        <meta name="format-detection" content="address=yes" />

        <meta name="author" content="Flamia Gas Delivery" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="googlebot" content="index, follow" />
        <meta name="google" content="notranslate" />
        <meta name="theme-color" content="#00b341" />
        <meta name="msapplication-TileColor" content="#00b341" />
        <meta name="msapplication-navbutton-color" content="#00b341" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="application-name" content="Flamia Gas Delivery" />
        <meta name="apple-mobile-web-app-title" content="Flamia Gas" />

        <meta itemProp="name" content="Flamia - Best Gas Delivery Service in Uganda" />
        <meta itemProp="description" content="Best gas delivery service in Uganda with free same-day delivery. Order Total, Shell, Oryx, Stabex & Hass gas cylinders at cheapest prices." />

        <link rel="preload" as="image" href="/images/oryx 6KG.png" />
        <link rel="preload" as="image" href="/images/hass 6KG.png" />
        <link rel="preload" as="image" href="/images/total 6KG.png" />
        <link rel="preload" as="image" href="/images/shell 6KG.png" />
        <link rel="preload" as="image" href="/images/stabex 6KG.png" />
        
        <script type="application/ld+json">
          {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Flamia Gas Delivery Service",
          "alternateName": ["Best Gas Delivery Uganda", "Fast Gas Delivery Kampala", "Premium Gas Delivery Service"],
          "description": "Uganda's best gas delivery service. Total, Shell, Stabex gas cylinders with free same-day delivery in Kampala, Wakiso, Mukono.",
          "url": "https://flamia.store",
          "telephone": "+256753894149",
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
          "areaServed": ["Kampala", "Wakiso", "Mukono", "Entebbe", "Jinja", "Masaka"],
          "serviceType": ["Gas Cylinder Delivery", "LPG Gas Delivery", "Cooking Gas Delivery", "Gas Refill Service", "Gas Accessories Delivery", "Same Day Gas Delivery"],
          "priceRange": "UGX 25,000 - UGX 350,000",
          "openingHours": ["Mo-Fr 07:30-22:00", "Sa 08:00-21:00", "Su 09:00-21:00"],
          "paymentAccepted": ["Cash", "Mobile Money", "Bank Transfer"],
          "currenciesAccepted": "UGX",
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Gas Products and Services",
            "itemListElement": [{
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": "Total Gas Cylinder Delivery",
                "description": "Total gas cylinders 6kg & 12kg with free delivery."
              }
            }, {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": "Shell Gas Delivery Service",
                "description": "Shell gas cylinders with same-day delivery."
              }
            }, {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": "Stabex Gas Refill",
                "description": "Stabex gas refill service with guaranteed best prices."
              }
            }]
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

        <script type="application/ld+json">
          {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Gas Cylinders Uganda - Total, Shell, Stabex",
          "description": "Best gas cylinder prices in Uganda. Total gas cylinder, Shell gas delivery, Stabex gas refill.",
          "brand": [{
            "@type": "Brand",
            "name": "Total Gas"
          }, {
            "@type": "Brand",
            "name": "Shell Gas"
          }, {
            "@type": "Brand",
            "name": "Stabex Gas"
          }, {
            "@type": "Brand",
            "name": "Hass Gas"
          }, {
            "@type": "Brand",
            "name": "Oryx Gas"
          }],
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
      </Helmet>

      <div className="min-h-screen pt-16 overflow-x-hidden">
        <div className="lg:hidden">
          <div className="px-4 md:px-6">
            <div className="flex flex-col gap-3 md:gap-6 my-0 py-0 rounded max-w-full">
              <HeaderSection />
              <ImageCarousel />
              <PromotionsSection />
              <FeaturedGadgets />

              <section className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl md:text-4xl font-bold mb-8 text-slate-950">
                    Premium Gas Cylinders
                  </h2>
                  <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-6xl mx-auto leading-relaxed">
                    Choose from our wide selection of certified gas cylinders with free same-day delivery across Kampala
                  </p>
                </div>

                <div className="w-full">
                  {isLoading ? <div className="flex justify-center py-16">
                      <div className="animate-spin h-12 w-12 border-4 border-accent rounded-full border-t-transparent"></div>
                    </div> : <BrandsGrid />}
                </div>
              </section>

              <section className="mt-16">
                <AccessoriesSection />
              </section>

              <div className="py-6">
                <div className="bg-primary/20 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-bold mb-3">
                    Can't decide which cylinder to buy?
                  </h3>
                  <p className="mb-4 text-base">
                    Contact our gas experts for personalized recommendations based on your household needs.
                  </p>
                  <Button className="bg-accent hover:bg-accent/90 text-white py-3 px-8 rounded-lg font-semibold text-base" onClick={() => window.open("https://wa.me/256787899483", "_blank")}>
                    Chat with Gas Expert
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="max-w-[1400px] mx-auto px-4 xl:px-6">
            <div className="bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 rounded-2xl p-8 mb-8 border border-accent/20">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                  <div className="text-center xl:text-left">
                    <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold mb-6 text-accent leading-tight">
                      Uganda's #1 Gas Delivery Service
                    </h1>
                    <p className="text-xl xl:text-2xl text-gray-700 mb-8 leading-relaxed">
                      Fast, reliable, and affordable gas delivery to your doorstep in Kampala and nearby areas
                    </p>
                    <div className="flex flex-wrap justify-center xl:justify-start gap-4">
                      <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg" onClick={() => navigate('/order')}>
                        Order Gas Now
                      </Button>
                      <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10 px-8 py-4 rounded-xl font-semibold text-lg" onClick={() => window.open("https://wa.me/256787899483", "_blank")}>
                        Get Help
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="xl:col-span-1">
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <h3 className="font-bold text-xl mb-4 text-gray-900 flex items-center gap-2">
                      <Star size={24} className="text-accent" />
                      Featured Products
                    </h3>
                    <div className="overflow-hidden">
                      <FeaturedGadgets />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-3">
                <div className="sticky top-24 space-y-6">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
                      <div className="flex items-center gap-3 text-white">
                        <Flame size={24} />
                        <div>
                          <h3 className="font-bold text-xl">Special Offers</h3>
                          <p className="text-white/90 text-sm">Full kits & packages</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <PromotionsSection />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-accent p-6">
                      <div className="flex items-center gap-3 text-white">
                        <Sparkles size={24} />
                        <div>
                          <h3 className="font-bold text-xl">Featured Deals</h3>
                          <p className="text-white/90 text-sm">Limited time offers</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <ImageCarousel />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <h3 className="font-bold text-xl mb-6 text-gray-900">Why Choose Flamia?</h3>
                    <div className="space-y-6">
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className="bg-accent/10 p-3 rounded-lg flex-shrink-0">
                            <feature.icon size={24} className="text-accent" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-base text-gray-900 mb-1">{feature.title}</h4>
                            <p className="text-sm text-gray-600">{feature.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-accent/10 rounded-2xl p-8 border border-accent/20">
                    <div className="text-center">
                      <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                        <Sparkles className="text-accent w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-xl mb-3">Need Expert Advice?</h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Get personalized gas cylinder recommendations from our experts
                      </p>
                      <Button className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-4 rounded-xl shadow-lg text-base" onClick={() => window.open("https://wa.me/256787899483", "_blank")}>
                        Chat with Gas Expert
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-9">
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl xl:text-4xl font-bold mb-4 text-slate-950">
                      Premium Gas Cylinders
                    </h2>
                    <p className="text-lg xl:text-xl text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                      Choose from our wide selection of certified gas cylinders with free same-day delivery across Kampala
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    {isLoading ? (
                      <div className="flex justify-center py-16">
                        <div className="animate-spin h-12 w-12 border-4 border-accent rounded-full border-t-transparent"></div>
                      </div>
                    ) : (
                      <BrandsGrid />
                    )}
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <AccessoriesSection />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>;
}
