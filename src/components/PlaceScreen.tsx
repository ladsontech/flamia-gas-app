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
            src="/images/icon.png" 
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
        <motion.p 
          className="text-sm text-gray-600 italic transform -rotate-2 flex items-center gap-1"
        >
          designed by{" "}
          <a 
            href="https://junooby.tech" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-accent hover:text-accent/80 transition-colors font-medium"
          >
            Jubooby
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default PlaceScreen;