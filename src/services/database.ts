
import { Order } from "@/types/order";
import { supabase } from "@/integrations/supabase/client";

// Hard-coded admin password check
export const verifyAdminPassword = async (password: string) => {
  return password === 'flamia2025';
};

// Authenticate delivery man
export const authenticateDeliveryMan = async (email: string, password: string) => {
  const { data, error } = await supabase.rpc('authenticate_delivery_man', {
    email_input: email,
    password_input: password
  });
  
  if (error) {
    console.error("Error authenticating delivery man:", error);
    throw error;
  }
  
  return data?.[0] || null;
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

// Fetch delivery men
export const fetchDeliveryMen = async () => {
  const { data, error } = await supabase
    .from('delivery_men')
    .select('*')
    .order('name');
  
  if (error) {
    console.error("Error fetching delivery men:", error);
    return [];
  }
  
  return data || [];
};

// Assign order to delivery man
export const assignOrderToDeliveryMan = async (orderId: string, deliveryManId: string) => {
  const { error } = await supabase
    .from('orders')
    .update({ 
      delivery_man_id: deliveryManId, 
      status: 'assigned',
      assigned_at: new Date().toISOString()
    })
    .eq('id', orderId);
  
  if (error) {
    console.error("Error assigning order:", error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: string) => {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  
  if (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// Create order - now saves to database AND links to authenticated user
export const createOrder = async (orderDetails: string, referralCode?: string) => {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  let referralId = null;
  
  // Handle referral if user is authenticated and we have a referral code
  if (referralCode && user) {
    try {
      // Find active referral for this user
      const { data: referralData } = await supabase
        .from('referrals')
        .select('id')
        .eq('referred_user_id', user.id)
        .eq('referral_code', referralCode.toUpperCase())
        .eq('status', 'pending')
        .maybeSingle();
      
      if (referralData) {
        referralId = referralData.id;
      }
    } catch (error) {
      console.error('Error finding referral:', error);
    }
  }
  
  const { error } = await supabase
    .from('orders')
    .insert([{
      description: orderDetails,
      status: 'pending',
      user_id: user?.id || null, // Link to user if authenticated
      referral_id: referralId // Link to referral if applicable
    }]);
  
  if (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};
