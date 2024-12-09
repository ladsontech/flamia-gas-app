import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface OrderHeaderProps {
  orderType: string;
}

export const OrderHeader = ({ orderType }: OrderHeaderProps) => (
  <div className="text-center mb-8">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 text-accent rounded-full text-sm mb-4"
    >
      <Flame className="w-4 h-4" />
      {orderType === "refill" ? "Refill Order" : "New Cylinder Order"}
    </motion.div>
    <motion.h1
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      className="text-2xl font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent"
    >
      Order Gas Cylinder
    </motion.h1>
  </div>
);