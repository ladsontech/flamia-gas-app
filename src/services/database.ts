
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/types/order";

export const verifyAdminPassword = async (password: string) => {
  const { data, error } = await supabase
    .from('admin_credentials')
    .select('password_hash')
    .single();

  if (error) throw error;
  
  return data.password_hash === password;
};

export const fetchOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return data as Order[];
};

export const updateOrderStatus = async (orderId: string, status: string, deliveryPerson?: string) => {
  const updates = {
    status,
    ...(deliveryPerson && { delivery_person: deliveryPerson }),
  };

  const { error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId);

  if (error) throw error;
};

export const createOrder = async (orderData: Omit<Order, 'id' | 'status' | 'created_at' | 'order_date' | 'delivery_person'>) => {
  const { error } = await supabase
    .from('orders')
    .insert([orderData]);

  if (error) throw error;
};
