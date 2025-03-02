
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
      </Helmet>

      <AppBar />

      <div className="flex-grow flex flex-col lg:flex-row">
        {/* Left sidebar/preview panel - visible only on large screens */}
        <div className="hidden lg:block lg:w-1/3 xl:w-1/4 border-r border-gray-200 bg-gray-50 p-4">
          <div className="sticky top-20">
            <CardCarousel />
            <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-3">Contact our gas experts for personalized recommendations.</p>
              <Button 
                size="sm" 
                className="w-full bg-accent hover:bg-accent/90 text-white" 
                onClick={() => {
                  window.open('https://wa.me/256789572007', '_blank');
                }}
              >
                Chat with Gas Expert
              </Button>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 w-full lg:w-2/3 xl:w-3/4">
          <div className="container px-3 py-3 md:py-4">
            {/* Mobile-only carousel */}
            <div className="lg:hidden">
              <CardCarousel />
            </div>
            
            <div className="flex flex-col gap-4 md:gap-6">
              <HeaderSection />

              {/* Main Content */}
              <section className="space-y-4 md:space-y-6">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-bold">Gas Cylinders</h2>
                </div>

                {/* Brands Grid */}
                <div className="px-1">
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin h-6 w-6 border-3 border-accent rounded-full border-t-transparent"></div>
                    </div>
                  ) : (
                    <BrandsGrid brands={[]} />
                  )}
                </div>

                {/* CTA Section - Mobile only */}
                <div className="py-4 md:py-6 lg:hidden">
                  <div className="bg-gradient-to-r from-primary/20 to-primary/40 rounded-lg p-3 sm:p-4 text-center">
                    <h3 className="text-lg sm:text-xl font-bold mb-2">Can't decide which cylinder to buy?</h3>
                    <p className="mb-3 text-xs sm:text-sm">
                      Contact our gas experts for personalized recommendations based on your household needs.
                    </p>
                    <Button 
                      size="sm" 
                      className="bg-accent hover:bg-accent/90 text-white" 
                      onClick={() => {
                        window.open('https://wa.me/256789572007', '_blank');
                      }}
                    >
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
