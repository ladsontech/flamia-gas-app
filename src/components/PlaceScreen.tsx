
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

const PlaceScreen = () => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center space-y-6"
      >
        <Flame className="w-24 h-24 text-accent animate-pulse" />
        <h1 className="text-4xl font-bold text-gray-800">flamia</h1>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute bottom-12 flex flex-col items-center"
      >
        <img
          src="/lovable-uploads/c2791a2b-59d6-4982-8cda-b78cbc2556b3.png"
          alt="Dots Logo"
          className="w-8 h-8 mb-2"
        />
        <p className="text-sm text-gray-600">from Dots</p>
      </motion.div>
    </div>
  );
};

export default PlaceScreen;
