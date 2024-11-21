import { motion } from "framer-motion";

const Accessories = () => {
  const accessories = [
    {
      name: "Gas Burner",
      description: "High-quality gas burner for cooking",
      price: "2500",
      image: "/placeholder.svg"
    },
    {
      name: "Gas Hose Pipe",
      description: "Standard length gas hose pipe",
      price: "800",
      image: "/placeholder.svg"
    },
    {
      name: "Gas Regulator",
      description: "Safety regulator for gas cylinders",
      price: "1200",
      image: "/placeholder.svg"
    },
    {
      name: "Cylinder Stand",
      description: "Sturdy stand for gas cylinders",
      price: "1500",
      image: "/placeholder.svg"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-2xl font-bold mb-6">Gas Accessories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accessories.map((accessory, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <img
              src={accessory.image}
              alt={accessory.name}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
            <h3 className="text-lg font-semibold">{accessory.name}</h3>
            <p className="text-gray-600 mt-2">{accessory.description}</p>
            <p className="text-accent font-bold mt-2">KES {accessory.price}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Accessories;