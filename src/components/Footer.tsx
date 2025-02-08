
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            src="/lovable-uploads/c2791a2b-59d6-4982-8cda-b78cbc2556b3.png"
            alt="Dots Logo"
            className="w-12 h-12"
          />
          <div className="text-center">
            <p className="text-sm text-gray-400">© 2024 Flamia. All rights reserved.</p>
            <p className="text-xs text-gray-500 mt-1">Made with ❤️ by Dots</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
