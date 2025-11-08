
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import HeaderSection from "@/components/home/HeaderSection";
import OverlayCarousel from "@/components/home/OverlayCarousel";
import QuickActionsSection from "@/components/home/QuickActionsSection";
import BrandsGrid from "@/components/home/BrandsGrid";
import PopularBrands from "@/components/home/PopularBrands";
import PromotionsSection from "@/components/home/PromotionsSection";
import AccessoriesSection from "@/components/home/AccessoriesSection";

const Index = () => {
  const canonicalUrl = "https://flamia.store/";
  
  return (
    <>
      <Helmet>
        <title>Flamia - Fast Gas Delivery Uganda | Cooking Gas Refill Kampala | LPG Home Delivery</title>
        <meta name="description" content="🔥 Best gas delivery service in Uganda! Order cooking gas refill, LPG cylinder delivery in Kampala, Entebbe, Wakiso. Total, Shell, Oryx gas. Same-day delivery. Affordable prices. Cook with confidence!" />
        <meta name="keywords" content="gas delivery Uganda, cooking gas delivery Kampala, home gas refill service, LPG gas refill near me, gas cylinder refill Kampala, Oryx gas refill price, Shell gas delivery, Total gas refill Uganda, buy gas cylinder online, order gas delivery in Entebbe, gas cylinder exchange, gas refill home delivery, 3kg gas refill, 6kg gas refill, 12.5kg gas refill, fast gas delivery Uganda, affordable gas refill prices, gas refill cost Kampala, LPG gas price Uganda, best gas prices in Kampala, gas delivery in Kampala, gas refill Entebbe, gas suppliers Namugongo, gas refill Kira, gas shop near me, LPG gas delivery Kampala suburbs, cooking gas supplier Uganda, gas refill Wakiso, LPG gas cylinder supply, gas delivery service provider, convenient cooking solutions, reliable home energy source, hassle-free gas delivery, cook with confidence, fast safe affordable gas, clean energy for every home" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content="Flamia - Fast Gas Delivery Uganda | Cooking Gas Refill Kampala" />
        <meta property="og:description" content="🔥 Best gas delivery service in Uganda! Order cooking gas refill, LPG cylinder delivery in Kampala, Entebbe, Wakiso. Same-day delivery. Affordable prices. Cook with confidence!" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Flamia - Fast & Reliable Gas Delivery" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Flamia - Fast Gas Delivery Uganda | Cooking Gas Refill Kampala" />
        <meta name="twitter:description" content="🔥 Order cooking gas refill, LPG cylinder delivery in Kampala, Entebbe, Wakiso. Same-day delivery. Affordable prices!" />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="geo.region" content="UG" />
        <meta name="geo.placename" content="Kampala" />
        <meta name="language" content="en" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-20 md:pt-24">
        {/* Container with larger desktop margins */}
        <div className="px-3 sm:px-4 lg:px-32 xl:px-48 2xl:px-64 py-2 sm:py-4 lg:py-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 sm:space-y-6 lg:space-y-8 xl:space-y-12"
          >
            <HeaderSection />
            
            <div className="space-y-6 lg:space-y-10 xl:space-y-14">
              <OverlayCarousel />
              
              <QuickActionsSection />
              
              <section className="space-y-4 lg:space-y-6">
                <h2 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold px-1">
                  Gas Cylinders
                </h2>
                <BrandsGrid />
              </section>

              <PopularBrands />
              
              <PromotionsSection />
              
              <AccessoriesSection />
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Index;
