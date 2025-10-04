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
import { User, LogOut, Settings, Store, BarChart3, TrendingUp, DollarSign, Users, Truck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link, useNavigate } from "react-router-dom";
import AppBar from "@/components/AppBar";
import { AddressManager } from "@/components/account/AddressManager";
import { PhoneManager } from "@/components/account/PhoneManager";
import { ReferralHub } from "@/components/account/ReferralHub";
import OrdersManager from "@/components/account/OrdersManager";
import { DeliveryDashboard } from "@/components/account/DeliveryDashboard";

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
  const navigateRouter = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPhoneUser, setIsPhoneUser] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const {
    toast
  } = useToast();
  const {
    userRole,
    isAdmin,
    isBusinessOwner,
    isDeliveryMan,
    loading: roleLoading
  } = useUserRole();
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
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
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
            user_metadata: {
              display_name: userName
            }
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
      const {
        data: existingProfile
      } = await supabase.from('profiles').select('display_name, full_name').eq('id', user.id).single();

      // If no display name but we have user metadata, update profile
      if (existingProfile && !existingProfile.display_name && user.user_metadata?.full_name) {
        await supabase.from('profiles').update({
          display_name: user.user_metadata.full_name,
          full_name: user.user_metadata.full_name
        }).eq('id', user.id);
      }
    } catch (error) {
      console.error('Error ensuring display name:', error);
    }
  };
  const fetchProfile = async (userId: string) => {
    try {
      const {
        data,
        error
      } = await supabase.from('profiles').select('*').eq('id', userId).single();
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
      const {
        data,
        error
      } = await supabase.from('profiles').select('*').eq('phone_number', phoneNumber).single();
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
        const {
          error
        } = await supabase.auth.signOut();
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
    return <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-20">
        <div className="px-3 sm:px-4 lg:px-32 xl:px-48 2xl:px-64 py-4 sm:py-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <Card key={i}>
                <CardContent className="p-4 sm:p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </div>;
  }

  // If not authenticated, redirect to sign in
  if (!user) {
    navigate('/signin');
    return null;
  }

  // Authenticated user view
  return (
    <div className="min-h-screen bg-background">
      <AppBar />
      <div className="pt-16 pb-20">
        {/* Compact Mobile Header */}
        <div className="bg-gradient-to-r from-background via-accent/5 to-background px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">{getDisplayName()}</h1>
              <div className="flex items-center gap-2 mt-1">
                {userRole !== 'user' && <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {userRole.replace('_', ' ')}
                  </Badge>}
                <p className="text-xs text-muted-foreground">
                  {user.email ? user.email.split('@')[0] : profile?.phone_number}
                </p>
              </div>
            </div>
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-accent" />
            </div>
          </div>
        </div>

        <div className="px-4 pt-2">

          {/* Compact Menu Items */}
          <div className="space-y-2">
            {/* Orders */}
            <Card className="cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98]">
              <CardContent className="p-0">
                <div className="p-4 flex items-center justify-between" onClick={() => setActiveSection('orders')}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <span className="font-medium text-foreground">My Orders</span>
                      <p className="text-xs text-muted-foreground">Track orders</p>
                    </div>
                  </div>
                  <div className="text-muted-foreground">›</div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Settings */}
            {!isPhoneUser && <Card className="cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98]">
                <CardContent className="p-0">
                  <div className="p-4 flex items-center justify-between" onClick={() => setActiveSection('profile')}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Settings className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Profile Settings</span>
                        <p className="text-xs text-muted-foreground">Manage profile</p>
                      </div>
                    </div>
                    <div className="text-muted-foreground">›</div>
                  </div>
                </CardContent>
              </Card>}

            {/* Business Dashboard */}
            {isBusinessOwner && <Card className="cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98]">
                <CardContent className="p-0">
                  <div className="p-4 flex items-center justify-between" onClick={() => setActiveSection('business')}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Store className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <span className="font-medium text-foreground">My Business</span>
                        <p className="text-xs text-muted-foreground">Manage business</p>
                      </div>
                    </div>
                    <div className="text-muted-foreground">›</div>
                  </div>
                </CardContent>
              </Card>}

            {/* Deliveries - Only for Delivery Men */}
            {isDeliveryMan && <Card className="cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98]">
                <CardContent className="p-0">
                  <div className="p-4 flex items-center justify-between" onClick={() => setActiveSection('deliveries')}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Truck className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Deliveries</span>
                        <p className="text-xs text-muted-foreground">Assigned orders & map</p>
                      </div>
                    </div>
                    <div className="text-muted-foreground">›</div>
                  </div>
                </CardContent>
              </Card>}

            {/* Referrals */}
            <Card className="cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98]">
              <CardContent className="p-0">
                <div className="p-4 flex items-center justify-between" onClick={() => setActiveSection('referrals')}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Referrals & Earnings</span>
                      <p className="text-xs text-muted-foreground">Refer and Earn</p>
                    </div>
                  </div>
                  <div className="text-muted-foreground">›</div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Panel */}
            {isAdmin && <Card className="cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98] border-accent/20">
                <CardContent className="p-0">
                  <Link to="/admin">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                          <Settings className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <span className="font-medium text-foreground">Admin Panel</span>
                          <p className="text-xs text-muted-foreground">System management</p>
                        </div>
                      </div>
                      <div className="text-muted-foreground">›</div>
                    </div>
                  </Link>
                </CardContent>
              </Card>}

            {/* Sign Out */}
            <div className="mt-6">
              <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98] border-destructive/20">
                    <CardContent className="p-0">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                            <LogOut className="w-5 h-5 text-destructive" />
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Sign Out</span>
                            <p className="text-xs text-muted-foreground">Logout from account</p>
                          </div>
                        </div>
                        <div className="text-muted-foreground">›</div>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Sign Out</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to sign out of your account?
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowLogoutDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        setShowLogoutDialog(false);
                        handleSignOut();
                      }}
                    >
                      Sign Out
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Active Section Content */}
        {activeSection && <div className="fixed inset-0 bg-background z-50">
            <div className="h-full flex flex-col">
              <div className="bg-background border-b px-4 py-4 flex items-center space-x-4 flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setActiveSection(null)}>
                  ← Back
                </Button>
                <h2 className="text-lg font-semibold">
                  {activeSection === 'orders' && 'My Orders'}
                  {activeSection === 'profile' && 'Profile Settings'}
                  {activeSection === 'business' && 'My Business'}
                  {activeSection === 'deliveries' && 'Deliveries'}
                  {activeSection === 'referrals' && 'Referrals & Earnings'}
                </h2>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
              {activeSection === 'orders' && <OrdersManager userRole={userRole} userId={user?.id} />}
              {activeSection === 'profile' && <div className="space-y-4">
                  <AddressManager />
                  <PhoneManager />
                </div>}
              {activeSection === 'deliveries' && <DeliveryDashboard userId={user.id} />}
              {activeSection === 'business' && <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        My Businesses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {businesses.length === 0 ? <div className="text-center py-8">
                          <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">No businesses assigned</h3>
                          <p className="text-muted-foreground">Contact admin to get your business assigned</p>
                        </div> : <div className="space-y-4">
                          {businesses.map(business => <Card key={business.id} className="border-l-4 border-l-primary">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  {business.image_url && <img src={business.image_url} alt={business.name} className="w-12 h-12 rounded-lg object-cover" />}
                                  <div className="flex-1">
                                    <h4 className="font-semibold">{business.name}</h4>
                                    <p className="text-sm text-muted-foreground">{business.location}</p>
                                    <p className="text-sm text-muted-foreground">{business.contact}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>)}
                        </div>}
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
                 </div>}
               {activeSection === 'referrals' && <ReferralHub />}
                </div>
              </div>
            </div>
          </div>}
      </div>
    </div>
  );
};

export default Account;