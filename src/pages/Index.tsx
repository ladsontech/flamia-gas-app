
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        <meta name="keywords" content="gas delivery Uganda, cooking gas delivery Kampala, home gas refill service, LPG gas refill near me, gas cylinder refill Kampala, Oryx gas refill price, Shell gas delivery, Total gas refill Uganda, buy gas cylinder online, order gas delivery in Entebbe, gas cylinder exchange, gas refill home delivery, 3kg gas refill, 6kg gas refill, 12.5kg gas refill, fast gas delivery Uganda, affordable gas refill prices, gas refill cost Kampala, LPG gas price Uganda, best gas prices in Kampala, gas delivery in Kampala, gas refill Entebbe, gas suppliers Namugongo, gas refill Kira, gas shop near me, LPG gas delivery Kampala suburbs, cooking gas supplier Uganda, gas refill Wakiso, gas delivery Banda, gas refill Kyambogo, gas delivery Kinawataka, gas refill Kireka, gas delivery Ntinda, gas refill Kiwatule, gas delivery Nakawa, gas refill Mbuya, gas delivery Bukoto, gas refill Kisasi, gas delivery Bweyogerere, gas refill Bugolobi, gas delivery Naguru, gas refill Mutungo, gas delivery Luzira, gas refill Namboole, gas delivery Seeta, gas refill Naalya, gas delivery Ntinda Stage, gas refill Ministers Village, gas delivery Bukasa, gas refill Muyenga, gas delivery Kololo, gas refill Kamwokya, gas delivery Wandegeya, gas refill Kasubi, gas delivery Kawaala, gas refill Naakulabye, gas delivery near Makerere University, gas refill Makerere, gas delivery near MUBS, gas refill MUBS Nakawa, gas delivery near KIU, gas refill KIU Kansanga, student gas delivery Kampala, university area gas refill, LPG gas cylinder supply, gas delivery service provider, convenient cooking solutions, reliable home energy source, hassle-free gas delivery, cook with confidence, fast safe affordable gas, clean energy for every home" />
        
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
              
              {/* Student Promo Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link to="/student-gas-delivery">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-shadow cursor-pointer">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4 text-white">
                        <div className="bg-white/20 p-3 rounded-full">
                          <GraduationCap className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold mb-1">
                            🎓 Student Special Offer!
                          </h3>
                          <p className="text-sm sm:text-base opacity-90">
                            Affordable 3kg gas + Free delivery to Makerere, Kyambogo, MUBS, KIU
                          </p>
                        </div>
                      </div>
                      <Button className="bg-white text-orange-600 hover:bg-gray-100 whitespace-nowrap">
                        View Offers
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
              
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
