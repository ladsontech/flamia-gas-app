import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { getUserBusinesses } from "@/services/adminService";
import { 
  User, 
  LogOut, 
  Settings,
  Store,
  BarChart3,
  TrendingUp,
  DollarSign,
  Users
} from "lucide-react";
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
        
        // Auto-sync display name if missing
        await ensureDisplayName(user);
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

  const ensureDisplayName = async (user: any) => {
    try {
      // Check if profile exists and has display_name
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('display_name, full_name')
        .eq('id', user.id)
        .single();

      // If no display name but we have user metadata, update profile
      if (existingProfile && !existingProfile.display_name && user.user_metadata?.full_name) {
        await supabase
          .from('profiles')
          .update({ 
            display_name: user.user_metadata.full_name,
            full_name: user.user_metadata.full_name 
          })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error ensuring display name:', error);
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
      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, description, status')
        .eq('user_id', userId)
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

  const getDisplayName = () => {
    return profile?.display_name || profile?.full_name || user?.user_metadata?.full_name || 'User';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-20">
        <div className="px-3 sm:px-4 lg:px-32 xl:px-48 2xl:px-64 py-4 sm:py-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4 sm:p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
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
      <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-20">
        <div className="px-3 sm:px-4 lg:px-32 xl:px-48 2xl:px-64 py-4 sm:py-6 space-y-4 sm:space-y-6">
          <Card className="text-center p-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to Your Account</h2>
            <p className="text-muted-foreground mb-6">Sign in to access your orders, preferences, and more</p>
            
            <div className="space-y-3 max-w-sm mx-auto">
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
          </Card>
        </div>
      </div>
    );
  }

  // Authenticated user view
  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-20">
      <AppBar />
      <div className="px-3 sm:px-4 lg:px-32 xl:px-48 2xl:px-64 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Welcome Header */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Welcome back, {getDisplayName()}!</h1>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    {user.email && <span>{user.email}</span>}
                    {profile?.phone_number && <span>{profile.phone_number}</span>}
                    {userRole !== 'user' && (
                      <Badge variant="secondary" className="ml-2">
                        {userRole.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            {isBusinessOwner && <TabsTrigger value="business">Business</TabsTrigger>}
            {!isPhoneUser && <TabsTrigger value="referrals">Referrals</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="orders" className="mt-6">
            <OrdersManager userRole={userRole} userId={user?.id} />
          </TabsContent>
          
          <TabsContent value="profile" className="mt-6 space-y-4">
            {!isPhoneUser && <AddressManager />}
            {!isPhoneUser && <PhoneManager />}
          </TabsContent>

          {isBusinessOwner && (
            <TabsContent value="business" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    My Businesses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {businesses.length === 0 ? (
                    <div className="text-center py-8">
                      <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No businesses assigned</h3>
                      <p className="text-muted-foreground">Contact admin to get your business assigned</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {businesses.map((business) => (
                        <Card key={business.id} className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {business.image_url && (
                                <img 
                                  src={business.image_url} 
                                  alt={business.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              )}
                              <div className="flex-1">
                                <h4 className="font-semibold">{business.name}</h4>
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
                    <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <TrendingUp className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                    </div>
                    <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <DollarSign className="h-8 w-8 mx-auto mb-3 text-green-600" />
                      <p className="text-2xl font-bold">UGX 0</p>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                    </div>
                    <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Users className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-muted-foreground">Customers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {!isPhoneUser && (
            <TabsContent value="referrals" className="mt-6">
              <ReferralManager />
            </TabsContent>
          )}
        </Tabs>

        {/* Admin Quick Access */}
        {isAdmin && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <Settings className="h-5 w-5" />
                Admin Panel Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Access advanced administrative features and manage the platform
              </p>
              <Button asChild className="w-full">
                <Link to="/admin">Go to Admin Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Account;