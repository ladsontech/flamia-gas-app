import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import HeaderSection from "@/components/home/HeaderSection";
import BrandsGrid from "@/components/home/BrandsGrid";
import { Helmet } from "react-helmet";
import AppBar from "@/components/AppBar";
import ImageCarousel from "@/components/home/ImageCarousel";
import PromotionsSection from "@/components/home/PromotionsSection";
import PopularBrands from "@/components/home/PopularBrands";
import { Sparkles, Zap, Shield, Clock } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const features = [
    { icon: Zap, title: "Lightning Fast", desc: "Same-day delivery" },
    { icon: Shield, title: "Guaranteed Quality", desc: "Certified gas suppliers" },
    { icon: Clock, title: "24/7 Support", desc: "Always here to help" },
  ];

  return <>
      <Helmet>
        <title>Flamia - Best Gas Delivery Service in Uganda | Free Same-Day Delivery</title>
        <meta name="description" content="Best gas delivery service in Uganda with free same-day delivery. Order Total, Shell, Oryx, Stabex & Hass gas cylinders at cheapest prices in Kampala, Wakiso & Mukono." />
        <meta name="keywords" content="best gas delivery service in Uganda, fastest gas delivery Kampala, same-day gas cylinder delivery, free gas delivery near me, gas cylinder home delivery, LPG gas delivery service, best gas app Uganda, Total gas delivery, Shell gas delivery, Stabex gas delivery, Hass gas delivery, Oryx gas delivery, Ultimate gas delivery, C gas delivery, alternative to Fumbaa gas" />

        <meta name="geo.region" content="UG" />
        <meta name="geo.placename" content="Kampala" />
        <meta name="geo.position" content="0.347596;32.582520" />
        <meta name="ICBM" content="0.347596, 32.582520" />
        <meta name="og:locale" content="en_UG" />
        <meta name="og:type" content="website" />
        <meta name="og:title" content="Flamia - Best Gas Delivery Service in Uganda | Free Same-Day Delivery" />
        <meta name="og:description" content="Best gas delivery service in Uganda with free same-day delivery. Order Total, Shell, Oryx, Stabex & Hass gas at cheapest prices. Faster than Fumbaa gas!" />
        <meta name="og:url" content="https://flamia.store/" />
        <meta name="og:site_name" content="Flamia Gas Delivery" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Flamia - Best Gas Delivery Service in Uganda | Free Same-Day Delivery" />
        <meta name="twitter:description" content="Fastest gas delivery service in Uganda with free same-day delivery. Better than Fumbaa gas with lower prices and faster service." />

        <meta name="content-language" content="en" />
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
      </Helmet>

      <AppBar />

      <div className="min-h-screen flex flex-col lg:flex-row mt-16">
        {/* Left Sidebar - Desktop Only */}
        <div className="hidden lg:block lg:w-80 xl:w-96 border-r border-gray-100 bg-gradient-to-b from-gray-50/50 to-white py-6 px-4">
          <div className="sticky top-20 space-y-6">
            {/* Featured Carousel */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-accent to-primary p-4">
                <div className="flex items-center gap-2 text-white">
                  <Sparkles size={20} />
                  <h3 className="font-bold text-lg">Featured Deals</h3>
                </div>
                <p className="text-white/90 text-sm mt-1">Limited time offers</p>
              </div>
              <div className="p-2">
                <ImageCarousel />
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Why Choose Flamia?</h3>
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

            {/* Contact Expert */}
            <div className="bg-gradient-to-br from-accent/10 via-primary/5 to-accent/10 rounded-2xl p-6 border border-accent/20">
              <div className="text-center">
                <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Sparkles className="text-accent" size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2">Need Expert Advice?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get personalized gas cylinder recommendations from our experts
                </p>
                <Button 
                  className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 rounded-xl shadow-lg"
                  onClick={() => window.open("https://wa.me/256789572007", "_blank")}
                >
                  Chat with Gas Expert
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full max-w-6xl mx-auto px-3 md:px-6 lg:px-6">
          <div className="flex flex-col gap-4 md:gap-6 my-0 py-4 rounded">
            {/* Hero Section - Enhanced for Desktop */}
            <div className="hidden lg:block bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10 rounded-3xl p-8 mb-6 border border-accent/20">
              <div className="text-center max-w-4xl mx-auto">
                <h1 className="text-4xl xl:text-5xl font-bold mb-4 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                  Uganda's #1 Gas Delivery Service
                </h1>
                <p className="text-xl text-gray-700 mb-6 max-w-2xl mx-auto">
                  Fast, reliable, and affordable gas delivery to your doorstep in Kampala, Wakiso, and Mukono
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button 
                    size="lg" 
                    className="bg-accent hover:bg-accent/90 text-white px-8 py-3 rounded-xl shadow-lg font-semibold"
                    onClick={() => navigate("/order")}
                  >
                    Order Gas Now
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-accent text-accent hover:bg-accent/10 px-8 py-3 rounded-xl font-semibold"
                    onClick={() => window.open("https://wa.me/256789572007", "_blank")}
                  >
                    Get Help
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden">
              <HeaderSection />
            </div>

            {/* Mobile/Tablet Components */}
            <div className="lg:hidden">
              <ImageCarousel />
              <PromotionsSection />
              <PopularBrands />
            </div>

            <section className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl lg:text-3xl font-bold mb-3 text-slate-950">
                  Premium Gas Cylinders
                </h2>
                <p className="text-base text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Choose from our wide selection of certified gas cylinders with free same-day delivery across Kampala
                </p>
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

            {/* Mobile Help Section */}
            <div className="py-4 md:hidden">
              <div className="bg-gradient-to-r from-primary/20 to-primary/40 rounded-xl p-4 text-center">
                <h3 className="text-lg font-bold mb-2">
                  Can't decide which cylinder to buy?
                </h3>
                <p className="mb-3 text-sm">
                  Contact our gas experts for personalized recommendations based on your household needs.
                </p>
                <Button 
                  className="bg-accent hover:bg-accent/90 text-white py-2 px-6 rounded-lg font-semibold"
                  onClick={() => window.open("https://wa.me/256789572007", "_blank")}
                >
                  Chat with Gas Expert
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Desktop Only */}
        <div className="hidden lg:block lg:w-80 xl:w-96 border-l border-gray-100 bg-gradient-to-b from-gray-50/50 to-white py-6 px-4">
          <div className="sticky top-20 space-y-6">
            {/* Quick Order */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-accent p-4">
                <h3 className="font-bold text-lg text-white">Quick Order</h3>
                <p className="text-white/90 text-sm">Skip the browse, order instantly</p>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Get your favorite gas cylinder delivered in just one click
                </p>
                <Button 
                  className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 rounded-xl shadow-lg"
                  onClick={() => navigate("/order")}
                >
                  Order Now
                </Button>
              </div>
            </div>

            {/* Promotions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Special Offers</h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      FREE
                    </div>
                    <span className="font-semibold text-sm">Delivery</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Free same-day delivery on all orders within Kampala
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      HOT
                    </div>
                    <span className="font-semibold text-sm">Best Prices</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Guaranteed lowest prices in Uganda
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Trusted by 1000+</h3>
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-accent rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-primary rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                      +
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Join thousands of satisfied customers across Uganda
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>;
}
