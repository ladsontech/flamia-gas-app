import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Package, Phone, Mail, LogOut, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { AddressManager } from '@/components/account/AddressManager';
import { PhoneManager } from '@/components/account/PhoneManager';
import { ReferralManager } from '@/components/account/ReferralManager';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Profile {
  id: string;
  full_name: string | null;
  display_name: string | null;
  phone_number: string | null;
}

interface Order {
  id: string;
  created_at: string;
  description: string;
  status: string;
}

const Account: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPhoneUser, setIsPhoneUser] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // First check for Supabase authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
        await fetchProfile(user.id);
        await fetchOrders(user.id); // Pass user ID to filter orders
      } else {
        // Check for phone-verified user
        const phoneVerified = localStorage.getItem('phoneVerified');
        const userName = localStorage.getItem('userName');
        
        if (phoneVerified && userName) {
          setIsPhoneUser(true);
          await fetchPhoneProfile(phoneVerified);
          setUser({ 
            id: phoneVerified, 
            email: null, 
            phone: phoneVerified,
            user_metadata: { display_name: userName }
          });
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchPhoneProfile = async (phoneNumber: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching phone profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching phone profile:', error);
    }
  };

  const fetchOrders = async (userId: string) => {
    try {
      console.log('Fetching orders for user in Account page:', userId);
      
      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, description, status')
        .eq('user_id', userId) // Filter by user_id
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      console.log('Fetched orders for user:', data);
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      if (isPhoneUser) {
        localStorage.removeItem('phoneVerified');
        localStorage.removeItem('userName');
        
        toast({
          title: "Signed out successfully",
          description: "You have been signed out of your account."
        });
        
        navigate('/');
      } else {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        toast({
          title: "Signed out successfully",
          description: "You have been signed out of your account."
        });
        
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'in_progress':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20 pb-20">
        <div className="px-3 sm:px-4 lg:px-32 xl:px-48 2xl:px-64 py-4 sm:py-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4 sm:p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, show guest view
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20 pb-20">
        <div className="px-3 sm:px-4 lg:px-32 xl:px-48 2xl:px-64 py-4 sm:py-6 space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <User className="w-5 h-5" />
                <span>Profile Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              <div className="text-center py-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold">Guest User</h3>
                <p className="text-gray-600 text-sm">Sign in to save your preferences</p>
              </div>
              
              <div className="space-y-2">
                <Button 
                  className="w-full"
                  onClick={() => navigate('/signin')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/signup')}
                >
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Authenticated user view
  return (
    <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20 pb-20">
      <div className="px-3 sm:px-4 lg:px-32 xl:px-48 2xl:px-64 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* User Profile Section */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold truncate">
                  {profile?.display_name || profile?.full_name || user?.user_metadata?.display_name || 'User'}
                </h3>
                {user.email && (
                  <p className="text-gray-600 text-xs sm:text-sm truncate">{user.email}</p>
                )}
                {(profile?.phone_number || user.phone) && (
                  <p className="text-gray-600 text-xs sm:text-sm truncate">
                    {profile?.phone_number || user.phone}
                  </p>
                )}
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex-shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Address Management */}
        {!isPhoneUser && <AddressManager />}

        {/* Phone Numbers Management */}
        {!isPhoneUser && <PhoneManager />}

        {/* Recent Orders - Activity Style */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Package className="w-5 h-5" />
              <span>Recent Orders</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {orders.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <Package className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4 text-sm sm:text-base">No orders yet</p>
                <Button onClick={() => navigate('/')} size="sm">
                  Place Your First Order
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <Collapsible 
                    key={order.id} 
                    open={expandedOrder === order.id}
                    onOpenChange={(isOpen) => setExpandedOrder(isOpen ? order.id : null)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">
                              Order #{order.id.slice(0, 8)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(order.created_at), 'dd/MM/yyyy, h:mma')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span className={`text-xs font-medium ${getStatusColor(order.status)} hidden sm:inline`}>
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-2 p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-sm mb-2">Order Details</h4>
                        <p className="text-sm text-gray-600 mb-3 break-words">{order.description}</p>
                        <div className="pt-3 border-t border-gray-200 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Order ID:</span>
                            <span className="font-medium break-all">{order.id}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Status:</span>
                            <span className={`font-medium ${getStatusColor(order.status)}`}>
                              {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
                
                {orders.length >= 3 && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => navigate('/orders')}
                    size="sm"
                  >
                    View All Orders
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referrals at the bottom */}
        {!isPhoneUser && <ReferralManager />}
      </div>
    </div>
  );
};

export default Account;
