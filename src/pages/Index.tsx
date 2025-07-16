
import React from "react";
import ImageCarousel from "@/components/home/ImageCarousel";
import BrandsGrid from "@/components/home/BrandsGrid";
import PopularBrands from "@/components/home/PopularBrands";
import AccessoriesSection from "@/components/home/AccessoriesSection";
import PromotionsSection from "@/components/home/PromotionsSection";
import AdSection from "@/components/ads/AdSection";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Truck, Clock, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Hero Carousel */}
        <ImageCarousel category="gas" />
        
        {/* Quick Order CTA */}
        <div className="bg-gradient-to-r from-accent to-orange-500 rounded-lg p-6 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Need Gas Delivery?</h2>
          <p className="mb-4 opacity-90">Fast, reliable gas delivery to your doorstep in Kampala</p>
          <Button 
            onClick={() => navigate('/order')}
            size="lg"
            className="bg-white text-accent hover:bg-gray-100 font-semibold"
          >
            Order Gas Now
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <Truck className="w-8 h-8 text-accent mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Free Delivery</h3>
            <p className="text-xs text-gray-600">Same day delivery</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <Clock className="w-8 h-8 text-accent mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Fast Service</h3>
            <p className="text-xs text-gray-600">2-4 hours delivery</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <Shield className="w-8 h-8 text-accent mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Safe & Secure</h3>
            <p className="text-xs text-gray-600">Quality guaranteed</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <ShoppingBag className="w-8 h-8 text-accent mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Easy Ordering</h3>
            <p className="text-xs text-gray-600">Simple checkout</p>
          </div>
        </div>

        {/* Featured Products */}
        <PopularBrands />
        
        {/* Gas Brands */}
        <BrandsGrid />
        
        {/* Accessories */}
        <AccessoriesSection />
        
        {/* Promotions */}
        <PromotionsSection />
        
        {/* Ads */}
        <AdSection />
      </div>
    </div>
  );
};

export default Index;
