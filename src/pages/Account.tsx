
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Package, Phone, Mail, Settings, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { AddressManager } from '@/components/account/AddressManager';
import { PhoneManager } from '@/components/account/PhoneManager';

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
        await fetchOrders();
      } else {
        // Check for phone-verified user
        const phoneVerified = localStorage.getItem('phoneVerified');
        const userName = localStorage.getItem('userName');
        
        if (phoneVerified && userName) {
          setIsPhoneUser(true);
          // Fetch phone user profile
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

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, description, status')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      if (isPhoneUser) {
        // Clear phone verification data
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">My Account</h1>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
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
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">My Account</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Profile Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">My Account</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* User Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Profile Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold">
                {profile?.display_name || profile?.full_name || user?.user_metadata?.display_name || 'User'}
              </h3>
              {user.email && <p className="text-gray-600 text-sm">{user.email}</p>}
              {(profile?.phone_number || user.phone) && (
                <p className="text-gray-600 text-sm">{profile?.phone_number || user.phone}</p>
              )}
              {isPhoneUser && (
                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs mt-2">
                  Phone Verified
                </span>
              )}
            </div>
            
            <Button 
              variant="outline"
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Phone Numbers Management */}
        {!isPhoneUser && <PhoneManager />}

        {/* Address Management */}
        {!isPhoneUser && <AddressManager />}

        {/* Order History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Recent Orders</span>
              </div>
              {orders.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/orders')}
                >
                  View All
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-6">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">No orders yet</p>
                <Button onClick={() => navigate('/order')}>
                  Place Your First Order
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium">
                        Order #{order.id.slice(0, 8)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(order.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {order.description}
                    </p>
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/orders')}>
              <Package className="w-4 h-4 mr-2" />
              My Orders
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <Phone className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card>
          <CardHeader>
            <CardTitle>About Flamia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-600">
              Your trusted partner for gas cylinders, gadgets, and food delivery in Uganda.
            </p>
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500">Version 1.0.0</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;
