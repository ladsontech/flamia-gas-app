
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
  
  return data as Order[] || [];
};

export const createOrder = async (orderDetails: string) => {
  const { error } = await supabase
    .from('orders')
    .insert([{
      description: orderDetails
    }]);
  
  if (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};
