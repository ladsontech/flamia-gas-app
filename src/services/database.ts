
import { Order } from "@/types/order";

// Hard-coded admin password check
export const verifyAdminPassword = async (password: string) => {
  return password === 'flamia123';
};

// Mock data for orders (local storage)
export const fetchOrders = async (): Promise<Order[]> => {
  const storedOrders = localStorage.getItem('orders');
  return storedOrders ? JSON.parse(storedOrders) : [];
};

export const updateOrderStatus = async (orderId: string, status: string, deliveryPerson?: string) => {
  const orders = await fetchOrders();
  const updatedOrders = orders.map(order => {
    if (order.id === orderId) {
      return {
        ...order,
        status,
        ...(deliveryPerson && { delivery_person: deliveryPerson }),
      };
    }
    return order;
  });
  
  localStorage.setItem('orders', JSON.stringify(updatedOrders));
};

export const createOrder = async (orderData: Omit<Order, 'id' | 'status' | 'created_at' | 'order_date' | 'delivery_person'>) => {
  const orders = await fetchOrders();
  const newOrder: Order = {
    ...orderData,
    id: `order-${Date.now()}`,
    status: 'pending',
    order_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    delivery_person: null
  };
  
  orders.push(newOrder);
  localStorage.setItem('orders', JSON.stringify(orders));
};
