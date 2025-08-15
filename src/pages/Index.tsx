
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import HeaderSection from "@/components/home/HeaderSection";
import OverlayCarousel from "@/components/home/OverlayCarousel";
import BrandsGrid from "@/components/home/BrandsGrid";
import PopularBrands from "@/components/home/PopularBrands";
import PromotionsSection from "@/components/home/PromotionsSection";
import AccessoriesSection from "@/components/home/AccessoriesSection";
import AdSection from "@/components/ads/AdSection";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Flamia - Gas Cylinders & Gadgets Delivery in Uganda</title>
        <meta name="description" content="Order gas cylinders and gadgets with same-day delivery in Kampala, Uganda. Best prices on Total, Shell, Oryx gas cylinders and electronics." />
        <meta name="keywords" content="gas cylinders Uganda, gas delivery Kampala, electronics Uganda, gadgets delivery, cooking gas, LPG cylinders" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
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
              
              <section className="space-y-4 lg:space-y-6">
                <h2 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold px-1">
                  Gas Cylinders
                </h2>
                <BrandsGrid />
              </section>

              <PopularBrands />
              
              <PromotionsSection />
              
              <AccessoriesSection />
              
              <AdSection />
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Index;
