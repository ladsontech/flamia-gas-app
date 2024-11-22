import { motion } from "framer-motion";

interface OrderHeaderProps {
  orderType: string;
}

export const OrderHeader = ({ orderType }: OrderHeaderProps) => (
  <div className="text-center mb-6">
    <span className="px-4 py-1 bg-accent text-white rounded-full text-sm mb-4 inline-block">
      {orderType === "refill" ? "Refill Order" : "New Cylinder Order"}
    </span>
    <h1 className="text-2xl font-bold">Order Gas Cylinder</h1>
  </div>
);