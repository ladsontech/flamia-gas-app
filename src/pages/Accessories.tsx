import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet";

// Static accessories data
const accessories = [{
  id: "1",
  name: "Gas Regulator",
  description: "Universal gas regulator compatible with all major gas brands in Uganda. Safe and reliable pressure control for all cylinder sizes.",
  price: 15000,
  image_url: "/images/regulator.jpeg"
}, {
  id: "2",
  name: "Gas Pipe (2 Meters)",
  description: "High-quality gas pipe that connects your cylinder to the cooker. Durable and leak-proof design for safety.",
  price: 8000,
  image_url: "/images/horse_pipe.jpeg"
}, {
  id: "3",
  name: "2-Burner Gas Stove",
  description: "Efficient 2-burner gas stove perfect for Ugandan kitchens. Compatible with all LPG cylinders and easy to clean.",
  price: 85000,
  image_url: "/images/2_plate_burner.jpeg"
}, {
  id: "4",
  name: "Cylinder Stand",
  description: "Sturdy gas cylinder stand for all sizes of LPG cylinders. Keeps your cylinder secure and prevents tipping.",
  price: 25000,
  image_url: "/images/gas_stand.png"
}, {
  id: "5",
  name: "6Kg Burner",
  description: "6kg gas cylinder burner for all brands.",
  price: 25000,
  image_url: "/images/6burner.png"
}, {
  id: "6",
  name: "Gas Lighter",
  description: "Long-lasting gas lighter with ergonomic design. Safe and reliable ignition for your gas cooker.",
  price: 5000,
  image_url: "/images/gas_lighter.jpeg"
}];
const Accessories = () => {
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const handleOrder = (accessoryId: string) => {
    navigate(`/order?accessory=${accessoryId}`);
  };
  if (loading) {
    return <div className="container mx-auto px-2 py-3">
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-center text-muted-foreground">Loading accessories...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Gas Accessories - Flamia</title>
        <meta name="description" content="Shop for gas accessories including regulators, pipes, stoves, and more. Free delivery in Kampala." />
        <meta name="keywords" content="gas accessories, gas regulator, gas pipe, gas stove, cylinder stand, LPG accessories" />
        {/* Preload critical images */}
        <link rel="preload" as="image" href="/images/regulator.jpeg" />
        <link rel="preload" as="image" href="/images/horse_pipe.jpeg" />
      </Helmet>
      
      <div className="container mx-auto px-2 py-3 flex-grow">
        <h1 className="text-lg sm:text-xl font-bold mb-3">Shop Accessories</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {accessories.map(accessory => <motion.div key={accessory.id} initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3
        }} className="h-full">
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden h-full flex flex-col">
                <CardHeader className="p-2">
                  <div className="relative w-full pb-[100%] mb-1 rounded-md overflow-hidden bg-gray-50">
                    <img src={accessory.image_url || '/images/accessory-fallback.jpg'} alt={accessory.name} loading="lazy" width="200" height="200" onError={e => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/accessory-fallback.jpg';
                }} className="absolute inset-0 w-full h-full hover:scale-105 transition-transform duration-300 object-scale-down" />
                  </div>
                  <CardTitle className="text-xs sm:text-sm font-medium">{accessory.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0 flex-grow">
                  <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
                    {accessory.description}
                  </p>
                  <p className="text-accent font-bold text-xs sm:text-sm mb-1">
                    UGX {accessory.price.toLocaleString()}
                  </p>
                </CardContent>
                <CardFooter className="p-2 pt-0">
                  <Button onClick={() => handleOrder(accessory.id)} className="w-full bg-accent hover:bg-accent/90 text-white text-xs py-1 h-7">
                    Order Now
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>)}
        </div>
      </div>
      <Footer />
    </div>;
};
export default Accessories;