import { AdminOrdersDashboard } from "./AdminOrdersDashboard";
import { Order, DeliveryMan } from "@/types/order";

interface AdminOrdersViewProps {
  orders: Order[];
  deliveryMen: DeliveryMan[];
  onOrdersUpdate: () => void;
}

export const AdminOrdersView = ({ orders, deliveryMen, onOrdersUpdate }: AdminOrdersViewProps) => {
  return (
    <AdminOrdersDashboard 
      userRole="super_admin" 
      userId="" 
    />
  );
};