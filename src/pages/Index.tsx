import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();

  const brands = [
    {
      name: "Stabex Gas",
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
      description: "High-quality gas cylinders for your home and business needs."
    },
    {
      name: "Total Gas",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      description: "Reliable gas solutions with nationwide coverage."
    },
    {
      name: "Shell Gas",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
      description: "Premium gas cylinders with safety guarantee."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-white">
      <div className="container px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Gas Delivery Service</h1>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="hover:bg-accent hover:text-accent-foreground"
            >
              Login
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/admin")}
              className="hover:bg-accent hover:text-accent-foreground"
            >
              Admin
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="px-4 py-1 bg-accent text-accent-foreground rounded-full text-sm mb-4 inline-block">
            Premium Gas Delivery
          </span>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Gas Delivery Made Simple
          </h2>
          <Button
            onClick={() => navigate("/refill")}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            View Refill Prices
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {brands.map((brand, index) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="glass-card p-6 hover-scale">
                <img
                  src={brand.image}
                  alt={brand.name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">{brand.name}</h3>
                <p className="text-muted-foreground mb-4">{brand.description}</p>
                <Button
                  onClick={() => navigate(`/order?brand=${brand.name}`)}
                  variant="outline"
                  className="w-full hover:bg-accent hover:text-accent-foreground"
                >
                  Order Now
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;