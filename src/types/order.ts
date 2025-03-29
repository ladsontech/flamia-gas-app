
export interface Order {
  id: string;
  quantity: number;
  status: string;
  order_date: string;
  created_at?: string;
  order_details: {
    customer?: string;
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
  };
}
