import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/types/order";

export interface DeliveryPersonProfile {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
}

export interface OrderWithDetails extends Order {
  delivery_man?: DeliveryPersonProfile;
  referral?: {
    id: string;
    referrer_id: string;
    referral_code: string;
  };
}

export class OrderService {
  // Fetch all delivery persons with proper profiles
  static async fetchDeliveryPersons(): Promise<DeliveryPersonProfile[]> {
    try {
      // Get users with delivery_man role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'delivery_man');

      if (roleError) throw roleError;
      if (!roleData || roleData.length === 0) return [];

      const userIds = roleData.map(item => item.user_id);

      // Get their profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, full_name, phone_number')
        .in('id', userIds);

      if (profileError) throw profileError;

      const profiles = profileData || [];
      const result: DeliveryPersonProfile[] = [];

      // Create profiles for missing delivery persons
      for (const userId of userIds) {
        const existingProfile = profiles.find(p => p.id === userId);
        
        if (existingProfile) {
          result.push({
            id: existingProfile.id,
            name: existingProfile.display_name || existingProfile.full_name || 'Delivery Person',
            email: '',
            phone_number: existingProfile.phone_number
          });
        } else {
          // Create missing profile
          try {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                display_name: 'Delivery Person',
                full_name: 'Delivery Person'
              });
            
            if (!insertError) {
              result.push({
                id: userId,
                name: 'Delivery Person',
                email: ''
              });
            }
          } catch (error) {
            console.error('Error creating profile for delivery person:', error);
            // Still add them to results
            result.push({
              id: userId,
              name: 'Delivery Person',
              email: ''
            });
          }
        }
      }

      return result;
    } catch (error) {
      console.error('Error fetching delivery persons:', error);
      return [];
    }
  }

  // Fetch orders with role-based filtering
  static async fetchOrders(userRole: string, userId?: string): Promise<OrderWithDetails[]> {
    try {
      let ordersQuery = supabase
        .from('orders')
        .select(`*`);

      // Apply role-based filtering
      switch (userRole) {
        case 'delivery_man':
          if (userId) {
            ordersQuery = ordersQuery.eq('delivery_man_id', userId);
          }
          break;
        case 'user':
          if (userId) {
            ordersQuery = ordersQuery.eq('user_id', userId);
          }
          break;
        case 'business_owner':
          // Business owners see orders related to their businesses via RLS
          break;
        case 'super_admin':
          // Super admins see all orders (no additional filtering)
          break;
        default:
          if (userId) {
            ordersQuery = ordersQuery.eq('user_id', userId);
          }
      }

      const { data: ordersData, error: ordersError } = await ordersQuery
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch delivery persons for orders
      const deliveryPersonIds = [...new Set(
        (ordersData || [])
          .map(order => order.delivery_man_id)
          .filter(Boolean)
      )] as string[];

      let deliveryPersons: DeliveryPersonProfile[] = [];
      if (deliveryPersonIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, display_name, full_name, phone_number')
          .in('id', deliveryPersonIds);

        deliveryPersons = (profileData || []).map(profile => ({
          id: profile.id,
          name: profile.display_name || profile.full_name || 'Delivery Person',
          email: '',
          phone_number: profile.phone_number
        }));
      }

      // Combine orders with delivery person data
      const ordersWithDetails: OrderWithDetails[] = (ordersData || []).map(order => ({
        id: order.id,
        created_at: order.created_at,
        description: order.description,
        delivery_man_id: order.delivery_man_id,
        status: order.status as 'pending' | 'assigned' | 'in_progress' | 'completed',
        assigned_at: order.assigned_at,
        user_id: order.user_id,
        delivery_man: order.delivery_man_id ? 
          deliveryPersons.find(dp => dp.id === order.delivery_man_id) : undefined,
        referral: Array.isArray(order.referrals) ? order.referrals[0] : order.referrals || undefined
      }));

      return ordersWithDetails;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  // Assign order to delivery person
  static async assignOrder(orderId: string, deliveryPersonId: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({
        delivery_man_id: deliveryPersonId,
        status: 'assigned',
        assigned_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) throw error;
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;
  }

  // Create order with referral tracking
  static async createOrder(orderDetails: string, referralCode?: string): Promise<void> {
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
        user_id: user?.id || null,
        referral_id: referralId
      }]);
    
    if (error) throw error;
  }

  // Get commission data for referrals
  static async getReferralCommissions(referrerId: string) {
    try {
      const { data: commissionsData, error } = await supabase
        .from('commissions')
        .select(`
          *,
          orders!inner(id, description, status, created_at),
          referrals!inner(id, referral_code, referred_user_id)
        `)
        .eq('referrals.referrer_id', referrerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const pendingEarnings = (commissionsData || [])
        .filter(c => c.orders.status !== 'completed')
        .reduce((sum, c) => sum + Number(c.amount), 0);

      const completedEarnings = (commissionsData || [])
        .filter(c => c.orders.status === 'completed')
        .reduce((sum, c) => sum + Number(c.amount), 0);

      return {
        commissions: commissionsData || [],
        pendingEarnings,
        completedEarnings,
        totalEarnings: pendingEarnings + completedEarnings
      };
    } catch (error) {
      console.error('Error fetching referral commissions:', error);
      return {
        commissions: [],
        pendingEarnings: 0,
        completedEarnings: 0,
        totalEarnings: 0
      };
    }
  }
}