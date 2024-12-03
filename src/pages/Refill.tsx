import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { Flame, ArrowRight } from "lucide-react";

const Refill = () => {
  const navigate = useNavigate();

  const prices = [
    {
      size: "3KG",
      price: "30,000",
      description: "Perfect for small households",
      color: "from-green-400 to-emerald-600"
    },
    {
      size: "6KG",
      price: "50,000",
      description: "Ideal for medium-sized families",
      color: "from-blue-400 to-blue-600"
    },
    {
      size: "12KG",
      price: "100,000",
      description: "Best for large families or businesses",
      color: "from-purple-400 to-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-white py-8">
      <div className="container px-4">
        <BackButton />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Gas Refill Prices</h1>
          <p className="text-muted-foreground">
            Choose the right size for your needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {prices.map((item, index) => (
            <motion.div
              key={item.size}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden p-6 hover:shadow-xl transition-shadow duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-10`} />
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-4">
                    <Flame className="w-12 h-12 text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-center">{item.size}</h2>
                  <div className="text-3xl font-bold text-center mb-2 text-accent">
                    UGX {item.price}
                  </div>
                  <p className="text-muted-foreground text-center mb-6">{item.description}</p>
                  <Button
                    onClick={() => navigate(`/order?type=refill&size=${item.size}`)}
                    className="w-full group"
                  >
                    Order Refill
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
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