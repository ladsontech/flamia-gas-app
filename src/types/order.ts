
export interface Order {
  id: string;
  created_at: string;
  description: string;
}

export interface OrderFormData {
  address: string;
  quantity: number;
  size: string;
  contact?: string;
  brand?: string;
  type?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}
