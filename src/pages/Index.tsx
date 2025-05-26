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
export default function Index() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
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
        <div className="hidden lg:block lg:w-56 xl:w-64 border-r border-gray-100 bg-gray-50/30 py-4 px-3">
          <div className="sticky top-20">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium mb-2">Need Help?</h3>
              <p className="text-xs text-gray-600 mb-3">
                Contact our gas experts for personalized recommendations.
              </p>
              <Button size="sm" className="w-full bg-accent hover:bg-accent/90 text-white text-xs py-1.5 h-7" onClick={() => {
              window.open("https://wa.me/256789572007", "_blank");
            }}>
                Chat with Expert
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full max-w-4xl mx-auto px-3 md:px-6 lg:px-4">
          <div className="flex flex-col gap-4 md:gap-5 my-0 py-2 rounded">
            <HeaderSection />

            {/* Mobile/Tablet Components */}
            <div className="lg:hidden">
              <ImageCarousel />
              <PromotionsSection />
              <PopularBrands />
            </div>

            <section className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl md:text-2xl lg:text-xl font-bold mb-2 text-slate-950">Gas full kits</h2>
                <p className="text-sm text-muted-foreground mb-3 text-center">Free  gas delivery around Kampala for all orders</p>
              </div>

              <div className="max-w-5xl mx-auto">
                {isLoading ? <div className="flex justify-center py-6">
                    <div className="animate-spin h-6 w-6 border-3 border-accent rounded-full border-t-transparent"></div>
                  </div> : <BrandsGrid brands={[]} />}
              </div>
            </section>

            {/* Mobile Help Section */}
            <div className="py-3 md:hidden">
              <div className="bg-gradient-to-r from-primary/20 to-primary/40 rounded-lg p-3 text-center">
                <h3 className="text-base sm:text-lg font-bold mb-1">
                  Can't decide which cylinder to buy?
                </h3>
                <p className="mb-2 text-xs">
                  Contact our gas experts for personalized recommendations based on your household needs.
                </p>
                <Button size="sm" className="bg-accent hover:bg-accent/90 text-white py-1 h-8" onClick={() => {
                window.open("https://wa.me/256789572007", "_blank");
              }}>
                  Chat with Gas Expert
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Desktop Only */}
        <div className="hidden lg:block lg:w-56 xl:w-64 border-l border-gray-100 bg-gray-50/30 py-4 px-3">
          <div className="sticky top-20 space-y-3">
            <ImageCarousel />

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium mb-2">Quick Order</h3>
              <p className="text-xs text-gray-600 mb-3">
                Order your favorite gas cylinder with just one click.
              </p>
              <Button size="sm" className="w-full bg-accent hover:bg-accent/90 text-white text-xs py-1.5 h-7" onClick={() => {
              navigate("/order");
            }}>
                Order Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>;
}