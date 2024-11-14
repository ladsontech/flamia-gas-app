import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();

  const brands = [
    {
      name: "Premium Gas",
      price: "$49.99",
      image: "/placeholder.svg",
      description: "High-quality gas cylinder for all your needs",
    },
    {
      name: "Standard Gas",
      price: "$39.99",
      image: "/placeholder.svg",
      description: "Reliable gas cylinder for everyday use",
    },
    {
      name: "Economy Gas",
      price: "$29.99",
      image: "/placeholder.svg",
      description: "Affordable gas cylinder solution",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-white">
      <div className="container px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="px-4 py-1 bg-accent text-accent-foreground rounded-full text-sm mb-4 inline-block">
            Premium Gas Delivery
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Gas Delivery Made Simple
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Order your gas cylinders online and get them delivered to your doorstep
          </p>
          <Button
            onClick={() => navigate("/order")}
            className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            Order Now
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
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-accent">
                    {brand.price}
                  </span>
                  <Button
                    onClick={() => navigate(`/order?brand=${brand.name}`)}
                    variant="outline"
                    className="hover:bg-accent hover:text-accent-foreground"
                  >
                    Select
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

export default Index;