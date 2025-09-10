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
  
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPhoneUser, setIsPhoneUser] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { toast } = useToast();
  const { userRole, isAdmin, isBusinessOwner, isDeliveryMan, loading: roleLoading } = useUserRole();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      if (user && !roleLoading) {
        await fetchProfile(user.id);
        
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
    <div className="min-h-screen bg-background">
      <AppBar />
      <div className="pt-16 pb-20">
        {/* Mobile Header */}
        <div className="bg-background border-b px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground">My account</h1>
        </div>

        {/* User Profile Card */}
        <div className="p-4">
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{getDisplayName()}</h2>
                  <div className="space-y-1">
                    {user.email && (
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    )}
                    {profile?.phone_number && (
                      <p className="text-sm text-muted-foreground">{profile.phone_number}</p>
                    )}
                    {userRole !== 'user' && (
                      <Badge variant="secondary" className="text-xs">
                        {userRole.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu Items */}
          <div className="space-y-2">
            {/* Orders */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="p-4 flex items-center justify-between" onClick={() => setActiveSection('orders')}>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-medium">My Orders</span>
                  </div>
                  <div className="w-5 h-5 text-muted-foreground">→</div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Settings */}
            {!isPhoneUser && (
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="p-4 flex items-center justify-between" onClick={() => setActiveSection('profile')}>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Settings className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="font-medium">Profile Settings</span>
                    </div>
                    <div className="w-5 h-5 text-muted-foreground">→</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Business Dashboard */}
            {isBusinessOwner && (
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="p-4 flex items-center justify-between" onClick={() => setActiveSection('business')}>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Store className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="font-medium">My Business</span>
                    </div>
                    <div className="w-5 h-5 text-muted-foreground">→</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Referrals */}
            {!isPhoneUser && (
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="p-4 flex items-center justify-between" onClick={() => setActiveSection('referrals')}>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-orange-600" />
                      </div>
                      <span className="font-medium">Referrals & Earnings</span>
                    </div>
                    <div className="w-5 h-5 text-muted-foreground">→</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Admin Panel */}
            {isAdmin && (
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-orange-200">
                <CardContent className="p-0">
                  <Link to="/admin">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                          <Settings className="w-5 h-5 text-orange-600" />
                        </div>
                        <span className="font-medium text-orange-700 dark:text-orange-300">Admin Panel</span>
                      </div>
                      <div className="w-5 h-5 text-orange-600">→</div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Sign Out */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="p-4 flex items-center justify-between" onClick={handleSignOut}>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <LogOut className="w-5 h-5 text-red-600" />
                    </div>
                    <span className="font-medium text-red-600">Sign Out</span>
                  </div>
                  <div className="w-5 h-5 text-red-600">→</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Active Section Content */}
        {activeSection && (
          <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
            <div className="bg-background border-b px-4 py-4 flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setActiveSection(null)}>
                ← Back
              </Button>
              <h2 className="text-lg font-semibold">
                {activeSection === 'orders' && 'My Orders'}
                {activeSection === 'profile' && 'Profile Settings'}
                {activeSection === 'business' && 'My Business'}
                {activeSection === 'referrals' && 'Referrals & Earnings'}
              </h2>
            </div>
            
            <div className="p-4">
              {activeSection === 'orders' && <OrdersManager userRole={userRole} userId={user?.id} />}
              {activeSection === 'profile' && (
                <div className="space-y-4">
                  <AddressManager />
                  <PhoneManager />
                </div>
              )}
              {activeSection === 'business' && (
                <div className="space-y-4">
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
                        <div className="space-y-4">
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

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Business Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-4">
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
                </div>
              )}
              {activeSection === 'referrals' && <ReferralManager />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;