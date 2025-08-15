import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import HeaderSection from "@/components/home/HeaderSection";
import BrandsGrid from "@/components/home/BrandsGrid";
import { Helmet } from "react-helmet";
import OverlayCarousel from "@/components/home/OverlayCarousel";
import PromotionsSection from "@/components/home/PromotionsSection";
import FeaturedGadgets from "@/components/home/PopularBrands";
import AccessoriesSection from "@/components/home/AccessoriesSection";
import { Sparkles, Zap, Shield, Clock, Star, Truck, MapPin, Phone, Flame } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

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

        <meta name="author" content="Flamia Gas" />
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
        <div className="px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex flex-col gap-3 md:gap-6 my-0 py-0 rounded max-w-full">
            <HeaderSection />
            <OverlayCarousel />
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
    </>;
}
