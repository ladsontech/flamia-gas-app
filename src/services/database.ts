
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

export const updateOrderStatus = async (orderId: string, status: string, deliveryPerson?: string) => {
  // First, get the current order to update order_details
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  
  if (fetchError) {
    console.error("Error fetching order:", fetchError);
    throw fetchError;
  }
  
  // Update the order_details with the new status and delivery person
  const updatedOrderDetails = {
    ...order.order_details,
    status,
    ...(deliveryPerson ? { delivery_person: deliveryPerson } : {})
  };
  
  // Update the record with the modified order_details
  const { error } = await supabase
    .from('orders')
    .update({
      status,
      order_details: updatedOrderDetails
    })
    .eq('id', orderId);
  
  if (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

export const createOrder = async (orderData: {
  customer: string;
  phone: string;
  address: string;
  brand: string;
  size: string;
  quantity: number;
  type: string;
}) => {
  const orderDetails = {
    ...orderData,
    status: 'pending',
    order_date: new Date().toISOString(),
    created_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('orders')
    .insert([{
      status: 'pending',
      quantity: orderData.quantity,
      order_date: new Date().toISOString(),
      order_details: orderDetails
    }]);
  
  if (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};
