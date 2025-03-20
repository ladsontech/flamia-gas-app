
export interface Order {
  id: string;
  customer: string;
  customer_name?: string | null;
  phone: string;
  address: string;
  brand: string;
  size: string;
  quantity: number;
  type: string;
  status: string;
  delivery_person?: string | null;
  order_date: string;
  created_at?: string;
}
