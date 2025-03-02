
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import HeaderSection from "@/components/home/HeaderSection";
import BrandsGrid from "@/components/home/BrandsGrid";
import ImageCarousel from "@/components/home/ImageCarousel";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet";
import AppBar from "@/components/AppBar";

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

      <div className="container px-4 py-4 md:py-6 flex-grow">
        {/* Image Carousel - Make sure it's properly displayed */}
        <ImageCarousel />
        
        <div className="flex flex-col gap-8 md:gap-12">
          <HeaderSection />

          {/* Main Content */}
          <section className="space-y-6 md:space-y-8">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Gas Cylinders - Free Delivery in Uganda</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Choose from a variety of gas cylinder brands and sizes. All orders include free delivery in Kampala, Wakiso, and Mukono.
              </p>
            </div>

            {/* Brands Grid */}
            <div className="px-1">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin h-8 w-8 border-4 border-accent rounded-full border-t-transparent"></div>
                </div>
              ) : (
                <BrandsGrid brands={[]} />
              )}
            </div>

            {/* CTA Section */}
            <div className="py-6 md:py-8">
              <div className="bg-gradient-to-r from-primary/20 to-primary/40 rounded-xl p-4 sm:p-6 md:p-8 text-center">
                <h3 className="text-xl sm:text-2xl font-bold mb-3 md:mb-4">Can't decide which cylinder to buy?</h3>
                <p className="mb-4 md:mb-6 text-sm sm:text-base">
                  Contact our gas experts for personalized recommendations based on your household needs.
                </p>
                <Button 
                  size="lg" 
                  className="bg-accent hover:bg-accent/90 text-white" 
                  onClick={() => {
                    // Open WhatsApp
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
      <Footer />
    </div>
  );
};

export default Index;
