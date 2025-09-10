import { OrderManagementHub } from "@/components/orders/OrderManagementHub";
import { supabase } from "@/integrations/supabase/client";
import { Order, DeliveryMan } from "@/types/order";

interface AdminOrdersViewProps {
  orders: Order[];
  deliveryMen: DeliveryMan[];
  onOrdersUpdate: () => void;
}

type GroupedOrders = {
  [date: string]: {
    orders: Order[];
    dateObj: Date;
  }
};

export const AdminOrdersView = ({ orders, deliveryMen, onOrdersUpdate }: AdminOrdersViewProps) => {
  return (
    <OrderManagementHub 
      userRole="super_admin" 
      userId="" 
    />
  );
};