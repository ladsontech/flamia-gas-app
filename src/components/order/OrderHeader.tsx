
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface OrderHeaderProps {
  orderType: string;
}

export const OrderHeader = ({ orderType }: OrderHeaderProps) => (
  <div className="text-center mb-4">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full text-xs mb-2"
    >
      <Flame className="w-3 h-3" />
      {orderType === "refill" ? "Refill Order" : "New Cylinder Order"}
    </motion.div>
    <motion.h1
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      className="text-xl font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent"
    >
      Order Gas Cylinder
    </motion.h1>
  </div>
);
