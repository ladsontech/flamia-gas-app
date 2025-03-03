
import { motion } from "framer-motion";
const HeaderSection = () => {
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.5
  }} className="text-center mb-3 md:mb-6 max-w-2xl mx-auto pt-2">
      <div className="bg-accent text-white px-3 py-2 rounded-lg inline-block mb-2 transform transition-all duration-300 hover:scale-105">
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold leading-tight">
          Quality Gas Cylinders
        </h2>
      </div>
      
    </motion.div>;
};
export default HeaderSection;
