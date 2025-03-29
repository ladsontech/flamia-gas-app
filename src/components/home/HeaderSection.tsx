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
      
      
    </motion.div>;
};
export default HeaderSection;