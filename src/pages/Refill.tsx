import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { Flame, ArrowRight } from "lucide-react";

const Refill = () => {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const sizes = [
    {
      size: "3KG",
      description: "Perfect for small households or portable use",
      color: "from-green-400 to-green-600",
      price: "UGX 25,000"
    },
    {
      size: "6KG",
      description: "Ideal for medium-sized families",
      color: "from-blue-400 to-blue-600",
      price: "UGX 50,000"
    },
    {
      size: "12KG",
      description: "Best value for large families or commercial use",
      color: "from-purple-400 to-purple-600",
      price: "UGX 100,000"
    }
  ];

  const handleOrder = (size: string, price: string) => {
    setSelectedSize(size);
    navigate(`/order?type=refill&size=${size}&price=${price}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-white py-4 sm:py-6">
      <div className="container px-2 sm:px-4">
        <BackButton />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Gas Refill Prices</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Choose your preferred gas cylinder size
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {sizes.map((item) => (
            <motion.div
              key={item.size}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="relative overflow-hidden p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-10`} />
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-3 sm:mb-4">
                    <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{item.size}</h2>
                  <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                  
                  <div className="space-y-4">
                    <div className="p-3 bg-accent/5 rounded-lg">
                      <p className="font-bold text-accent text-lg sm:text-xl mb-3">
                        {item.price}
                      </p>
                      <Button
                        onClick={() => handleOrder(item.size, item.price)}
                        className="w-full group text-sm py-1"
                      >
                        Order Refill
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Refill;