import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";

const Refill = () => {
  const navigate = useNavigate();

  const prices = [
    {
      size: "3KG",
      price: "30,000",
      description: "Perfect for small households"
    },
    {
      size: "6KG",
      price: "50,000",
      description: "Ideal for medium-sized families"
    },
    {
      size: "12KG",
      price: "100,000",
      description: "Best for large families or businesses"
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
          <h1 className="text-4xl font-bold mb-4">Refill Prices</h1>
          <p className="text-muted-foreground">
            Choose the right size for your needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {prices.map((item, index) => (
            <motion.div
              key={item.size}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 text-center">
                <h2 className="text-2xl font-bold mb-2">{item.size}</h2>
                <div className="text-3xl font-bold text-primary mb-2">
                  UGX {item.price}
                </div>
                <p className="text-muted-foreground mb-4">{item.description}</p>
                <Button
                  onClick={() => navigate(`/order?type=refill&size=${item.size}`)}
                  className="w-full"
                >
                  Order Refill
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Refill;