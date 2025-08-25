
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
        <title>Flamia - Best Gas Delivery Service in Uganda | Same Day LPG Delivery</title>
        <meta name="description" content="Order gas cylinders with same-day delivery in Kampala, Uganda. Best prices on Total, Shell, Oryx, Stabex gas cylinders. Free delivery in Kampala, Wakiso, Mukono." />
        <meta name="keywords" content="gas cylinders Uganda, gas delivery Kampala, LPG delivery, cooking gas, Total gas, Shell gas, Oryx gas, Stabex gas" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content="Flamia - Best Gas Delivery Service in Uganda" />
        <meta property="og:description" content="Order gas cylinders with same-day delivery in Kampala. Best prices on Total, Shell, Oryx gas cylinders. Free delivery." />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Flamia Gas Delivery" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Flamia - Best Gas Delivery Service in Uganda" />
        <meta name="twitter:description" content="Order gas cylinders with same-day delivery in Kampala. Best prices on Total, Shell, Oryx gas cylinders." />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="geo.region" content="UG" />
        <meta name="geo.placename" content="Kampala" />
        <meta name="language" content="en" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-20 md:pt-24">
        {/* Container with larger desktop margins */}
        <div className="px-3 sm:px-4 lg:px-8 xl:px-16 2xl:px-24 py-2 sm:py-4 lg:py-6">
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
