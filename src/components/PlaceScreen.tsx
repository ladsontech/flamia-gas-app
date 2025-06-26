
import { motion } from "framer-motion";

const PlaceScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-white to-accent/5 backdrop-blur-md z-50 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        className="flex flex-col items-center space-y-4"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.8, 1] }}
          transition={{ times: [0, 0.4, 0.7, 1], duration: 3, repeat: Infinity, repeatDelay: 1 }}
        >
          <img 
            src="/icon.png" 
            alt="Flamia Logo" 
            className="w-32 h-32" 
          />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-5xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent font-serif tracking-wide"
        >
          flamia
        </motion.h1>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.7 }}
        className="absolute bottom-16 flex flex-col items-center"
      >
        <img
          src="/lovable-uploads/c2791a2b-59d6-4982-8cda-b78cbc2556b3.png"
          alt="Dots Logo"
          className="w-8 h-8 mb-1"
        />
        <motion.p 
          className="text-sm text-gray-600 italic transform -rotate-2"
        >
          from Dots
        </motion.p>
      </motion.div>
    </div>
  );
};

export default PlaceScreen;
