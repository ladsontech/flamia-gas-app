import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { getUserBusinesses } from "@/services/adminService";
import { 
  User, 
  LogOut, 
  ChevronDown, 
  Clock, 
  Package, 
  Truck, 
  CheckCircle,
  TrendingUp,
  DollarSign,
  BarChart3,
  Users,
  Store,
  Settings
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import AppBar from "@/components/AppBar";
import { AddressManager } from "@/components/account/AddressManager";
import { PhoneManager } from "@/components/account/PhoneManager";
import { ReferralManager } from "@/components/account/ReferralManager";
import OrdersManager from "@/components/account/OrdersManager";

// Define interfaces
interface Profile {
  id: string;
  full_name?: string;
  display_name?: string;
  phone_number?: string;
}

interface Order {
  id: string;
  created_at: string;
  description: string;
  status?: string;
}

interface Business {
  id: string;
  name: string;
  location: string;
  contact: string;
  description?: string;
  image_url?: string;
}

const Account = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPhoneUser, setIsPhoneUser] = useState(false);
  const { toast } = useToast();
  const { userRole, isAdmin, isBusinessOwner, isDeliveryMan, loading: roleLoading } = useUserRole();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      if (user && !roleLoading) {
        await fetchProfile(user.id);
        await fetchOrders(user.id);
        
        // Fetch businesses if user is business owner
        if (isBusinessOwner) {
          try {
            const userBusinesses = await getUserBusinesses(user.id);
            setBusinesses(userBusinesses);
          } catch (error) {
            console.error('Error fetching user businesses:', error);
          }
        }
      }
    };

    loadUserData();
  }, [user, isBusinessOwner, roleLoading]);

  const checkAuthStatus = async () => {
    try {
      // First check for Supabase authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
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

  const navigate = (path: string) => {
    window.location.href = path;
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
      <AppBar />
      <div className="px-3 sm:px-4 lg:px-32 xl:px-48 2xl:px-64 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="space-y-6">
          {/* User Profile Summary */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  My Profile
                  {userRole !== 'user' && (
                    <Badge variant="outline" className="ml-2">
                      {userRole.replace('_', ' ')}
                    </Badge>
                  )}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Name:</strong> {profile?.full_name || profile?.display_name || 'Not set'}</p>
                {profile?.phone_number && (
                  <p><strong>Phone:</strong> {profile.phone_number}</p>
                )}
                <p><strong>Email:</strong> {user.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Role-based Content */}
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              {isBusinessOwner && <TabsTrigger value="business">Business</TabsTrigger>}
              {!isPhoneUser && <TabsTrigger value="referrals">Referrals</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="orders" className="space-y-4">
              <OrdersManager userRole={userRole} userId={user?.id} />
            </TabsContent>
            
            <TabsContent value="profile" className="space-y-4">
              {/* Address Manager for non-phone users */}
              {!isPhoneUser && <AddressManager />}
              
              {/* Phone Manager for non-phone users */}
              {!isPhoneUser && <PhoneManager />}
            </TabsContent>

            {isBusinessOwner && (
              <TabsContent value="business" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      My Businesses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {businesses.length === 0 ? (
                      <div className="text-center py-6">
                        <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">No businesses assigned yet</p>
                        <p className="text-sm text-muted-foreground">Contact admin to get your business assigned</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {businesses.map((business) => (
                          <Card key={business.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                {business.image_url && (
                                  <img 
                                    src={business.image_url} 
                                    alt={business.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                )}
                                <div>
                                  <h4 className="font-medium">{business.name}</h4>
                                  <p className="text-sm text-muted-foreground">{business.location}</p>
                                  <p className="text-sm text-muted-foreground">{business.contact}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Business Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Business Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <p className="text-2xl font-bold">UGX 0</p>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-sm text-muted-foreground">Customers</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {!isPhoneUser && (
              <TabsContent value="referrals" className="space-y-4">
                <ReferralManager />
              </TabsContent>
            )}
          </Tabs>

          {/* Admin Quick Access */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Admin Panel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/admin">Go to Admin Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;