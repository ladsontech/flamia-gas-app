// Simplified database service - no longer using Supabase for orders
// Orders are now handled via WhatsApp

// Hard-coded admin password check
export const verifyAdminPassword = async (password: string) => {
  return password === 'flamia2025';
};

// Authenticate delivery man
export const authenticateDeliveryMan = async (email: string, password: string) => {
  // This would need to be implemented if delivery management is still needed
  // For now, returning null since orders go through WhatsApp
  return null;
};

// Fetch orders from Supabase (for admin use only)
export const fetchOrders = async () => {
  // Return empty array since orders are now handled via WhatsApp
  return [];
};

// Fetch delivery men
export const fetchDeliveryMen = async () => {
  // Return empty array since delivery is managed via WhatsApp
  return [];
};

// Assign order to delivery man
export const assignOrderToDeliveryMan = async (orderId: string, deliveryManId: string) => {
  // No longer needed since orders go through WhatsApp
  throw new Error('Orders are now handled via WhatsApp');
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: string) => {
  // No longer needed since orders go through WhatsApp
  throw new Error('Orders are now handled via WhatsApp');
};

// Create order - now redirects to WhatsApp
export const createOrder = async (orderDetails: string) => {
  // This function is no longer used since orders go directly to WhatsApp
  // Keeping it for compatibility but it won't be called
  throw new Error('Orders are now handled via WhatsApp');
};