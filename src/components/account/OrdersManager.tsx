import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { OrderManagementHub } from "@/components/orders/OrderManagementHub";
import { Clock, Package, Truck, CheckCircle, User, MapPin } from "lucide-react";
import { format } from "date-fns";

interface Order {
  id: string;
  created_at: string;
  description: string;
  status: string;
  delivery_man_id?: string | null;
  assigned_at?: string | null;
  user_id?: string;
}

interface DeliveryMan {
  id: string;
  name: string;
  email: string;
}

interface OrdersManagerProps {
  userRole: 'super_admin' | 'business_owner' | 'delivery_man' | 'user';
  userId: string;
}

const OrdersManager = ({ userRole, userId }: OrdersManagerProps) => {
  return <OrderManagementHub userRole={userRole} userId={userId} />;
};

export default OrdersManager;