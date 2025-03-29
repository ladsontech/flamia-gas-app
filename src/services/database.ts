
import { Order } from "@/types/order";
import { supabase } from "@/integrations/supabase/client";

// Hard-coded admin password check
export const verifyAdminPassword = async (password: string) => {
  return password === 'flamia2025';
};

// Fetch orders from Supabase
export const fetchOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
  
  return data || [];
};

export const updateOrderStatus = async (orderId: string, status: string, deliveryPerson?: string) => {
  const { error } = await supabase
    .from('orders')
    .update({
      status,
      ...(deliveryPerson && { delivery_person: deliveryPerson }),
    })
    .eq('id', orderId);
  
  if (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

export const createOrder = async (orderData: Omit<Order, 'id' | 'status' | 'created_at' | 'order_date' | 'delivery_person'>) => {
  const { error } = await supabase
    .from('orders')
    .insert([{
      ...orderData,
      status: 'pending',
      order_date: new Date().toISOString(),
    }]);
  
  if (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};
