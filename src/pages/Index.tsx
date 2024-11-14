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
      sizes: ["6kg", "12kg", "45kg"],
      prices: {
        "6kg": "3,400",
        "12kg": "5,900",
        "45kg": "19,500"
      }
    },
    {
      name: "Total Gas",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      sizes: ["6kg", "12kg", "45kg"],
      prices: {
        "6kg": "3,500",
        "12kg": "6,000",
        "45kg": "20,000"
      }
    },
    {
      name: "Orynx Gas",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
      sizes: ["6kg", "12kg", "45kg"],
      prices: {
        "6kg": "3,450",
        "12kg": "5,950",
        "45kg": "19,800"
      }
    },
    {
      name: "Meru Gas",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
      sizes: ["6kg", "12kg", "45kg"],
      prices: {
        "6kg": "3,300",
        "12kg": "5,800",
        "45kg": "19,000"
      }
    },
    {
      name: "Shell Gas",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
      sizes: ["6kg", "12kg", "45kg"],
      prices: {
        "6kg": "3,600",
        "12kg": "6,100",
        "45kg": "20,500"
      }
    },
    {
      name: "Hass Gas",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
      sizes: ["6kg", "12kg", "45kg"],
      prices: {
        "6kg": "3,350",
        "12kg": "5,850",
        "45kg": "19,200"
      }
    },
    {
      name: "Hashi Gas",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
      sizes: ["6kg", "12kg", "45kg"],
      prices: {
        "6kg": "3,250",
        "12kg": "5,750",
        "45kg": "18,500"
      }
    }
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
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => navigate("/order?type=new")}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Buy New Cylinder
            </Button>
            <Button
              onClick={() => navigate("/order?type=refill")}
              variant="outline"
              className="hover:bg-accent hover:text-accent-foreground"
            >
              Refill Cylinder
            </Button>
          </div>
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
                <div className="space-y-2">
                  {Object.entries(brand.prices).map(([size, price]) => (
                    <div key={size} className="flex justify-between items-center">
                      <span>{size}</span>
                      <span className="font-bold">KES {price}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => navigate(`/order?brand=${brand.name}`)}
                  variant="outline"
                  className="w-full mt-4 hover:bg-accent hover:text-accent-foreground"
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