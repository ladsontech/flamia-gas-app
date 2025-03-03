
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import HeaderSection from "@/components/home/HeaderSection";
import BrandsGrid from "@/components/home/BrandsGrid";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet";
import AppBar from "@/components/AppBar";
import CardCarousel from "@/components/home/CardCarousel";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Flamia - Best Gas Delivery & Refill Service in Uganda | Free Delivery</title>
        <meta name="description" content="Order cooking gas with free delivery in Kampala, Wakiso & Mukono. Best prices on Total, Shell, Oryx, Stabex & Hass gas cylinders. Same-day LPG delivery." />
        <meta name="keywords" content="gas delivery Uganda, LPG delivery Kampala, cooking gas near me, cheap gas cylinders, gas refill service, Total gas Uganda, Shell gas delivery, Oryx gas price, Stabex gas cylinder, Hass gas Wakiso, free gas delivery" />
        <link rel="preload" as="image" href="/images/oryx 6KG.png" />
        <link rel="preload" as="image" href="/images/hass 6KG.png" />
        <link rel="preload" as="image" href="/images/total 6KG.png" />
        <link rel="preload" as="image" href="/images/shell 6KG.png" />
        <link rel="preload" as="image" href="/images/stabex 6KG.png" />
      </Helmet>

      <AppBar />

      <div className="flex-grow flex flex-col lg:flex-row pt-16"> {/* Added padding-top (pt-16) here */}
        {/* Left sidebar/preview panel - visible only on large screens */}
        <div className="hidden lg:block lg:w-1/3 xl:w-1/4 border-r border-gray-200 bg-gray-50 py-2 px-2">
          <div className="sticky top-16">
            <CardCarousel />
            <div className="mt-3 bg-white p-3 rounded-lg shadow-sm">
              <h3 className="text-base font-medium mb-1">Need Help?</h3>
              <p className="text-xs text-gray-600 mb-2">Contact our gas experts for personalized recommendations.</p>
              <Button size="sm" className="w-full bg-accent hover:bg-accent/90 text-white py-1 h-8" onClick={() => {
              window.open('https://wa.me/256789572007', '_blank');
            }}>
                Chat with Gas Expert
              </Button>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 w-full lg:w-2/3 xl:w-3/4">
          <div className="container px-2 py-2 md:py-3">
            {/* Mobile-only carousel */}
            <div className="lg:hidden">
              <CardCarousel />
            </div>
            
            <div className="flex flex-col gap-3 md:gap-4">
              <HeaderSection />

              {/* Main Content */}
              <section className="space-y-3 md:space-y-4">
                <div className="text-center">
                  
                </div>

                {/* Brands Grid */}
                <div className="px-1">
                  {isLoading ? <div className="flex justify-center py-6">
                      <div className="animate-spin h-6 w-6 border-3 border-accent rounded-full border-t-transparent"></div>
                    </div> : <BrandsGrid brands={[]} />}
                </div>

                {/* CTA Section - Mobile only */}
                <div className="py-3 md:py-4 lg:hidden">
                  <div className="bg-gradient-to-r from-primary/20 to-primary/40 rounded-lg p-3 text-center">
                    <h3 className="text-base sm:text-lg font-bold mb-1">Can't decide which cylinder to buy?</h3>
                    <p className="mb-2 text-xs">
                      Contact our gas experts for personalized recommendations based on your household needs.
                    </p>
                    <Button size="sm" className="bg-accent hover:bg-accent/90 text-white py-1 h-8" onClick={() => {
                    window.open('https://wa.me/256789572007', '_blank');
                  }}>
                      Chat with Gas Expert
                    </Button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
