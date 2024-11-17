export interface Order {
  id: string;
  customer: string;
  phone: string;
  address: string;
  brand: string;
  size: string;
  quantity: number;
  type: "new" | "refill";
  status: "pending" | "assigned" | "delivered";
  delivery_person?: string | null;
  order_date: string;
  created_at?: string;
}