
export interface Order {
  id: string;
  created_at: string;
  description: string;
  delivery_man_id?: string;
  status?: 'pending' | 'assigned' | 'in_progress' | 'completed';
  assigned_at?: string;
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

export interface DeliveryMan {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}
