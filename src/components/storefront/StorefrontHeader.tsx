import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  User, 
  LogIn, 
  LogOut, 
  ShoppingBag, 
  Settings,
  BarChart3
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface StorefrontHeaderProps {
  shopName: string;
  shopSlug?: string;
  shopLogoUrl?: string;
  isOwner: boolean;
  shopType?: 'seller' | 'affiliate';
  onShowAnalytics?: () => void;
}

export const StorefrontHeader = ({ 
  shopName,
  shopSlug,
  shopLogoUrl, 
  isOwner,
  shopType = 'seller',
  onShowAnalytics 
}: StorefrontHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Accept session handoff via URL (for subdomain storefronts opened from main app)
  useEffect(() => {
    const paramsFromHash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const paramsFromQuery = new URLSearchParams(window.location.search);
    const accessToken = paramsFromHash.get('access_token') || paramsFromQuery.get('access_token');
    const refreshToken = paramsFromHash.get('refresh_token') || paramsFromQuery.get('refresh_token');
    if (accessToken && refreshToken) {
      (async () => {
        try {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        } catch (e) {
          console.warn('Session handoff failed', e);
        } finally {
          // Clean tokens from URL
          const cleanUrl = window.location.origin + window.location.pathname + window.location.search.replace(/([?&])(access_token|refresh_token)=[^&#]*(#|&|$)/g, '$1')
            .replace(/[?&]$/, '');
          window.history.replaceState({}, '', cleanUrl);
        }
      })();
    }
  }, []);

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url, full_name')
        .eq('id', userId)
        .single();
      
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await loadUserProfile(user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleNavigateToAccount = () => {
    // Navigate to account page on main Flamia site
    window.location.href = 'https://flamia.store/account';
  };

  const handleNavigateToOrders = () => {
    // Navigate to orders page on main Flamia site
    window.location.href = 'https://flamia.store/orders';
  };

  const handleSignIn = () => {
    try {
      // Navigate to storefront auth page
      const returnTo = encodeURIComponent(window.location.href);
      if (shopSlug) {
        const authUrl = `/store/${shopSlug}/auth?return_to=${returnTo}`;
        console.log('Navigating to:', authUrl);
        window.location.href = authUrl;
      } else {
        // Fallback to Google OAuth
        console.log('No shopSlug, using Google OAuth');
        handleGoogleSignIn();
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: 'Error',
        description: 'Failed to navigate to sign in page',
        variant: 'destructive',
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const returnTo = window.location.href;
      const redirectTo = `https://flamia.store/auth/callback?return_to=${encodeURIComponent(returnTo)}`;
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Use main site callback which will bounce back to this storefront via return_to
          redirectTo
        }
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDashboard = () => {
    try {
      if (shopSlug) {
        const dashboardUrl = `/store/${shopSlug}/dashboard`;
        console.log('Navigating to dashboard:', dashboardUrl);
        window.location.href = dashboardUrl;
      } else {
        console.warn('No shopSlug available for dashboard navigation');
        toast({
          title: 'Error',
          description: 'Unable to navigate to dashboard',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Dashboard navigation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to navigate to dashboard',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="bg-gradient-to-r from-orange-50 via-white to-orange-50 sticky top-0 z-[100] shadow-md border-b border-orange-100">
      <div className="container max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo/Shop Name */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-1 min-w-0">
            {shopLogoUrl ? (
              <img 
                src={shopLogoUrl} 
                alt={shopName}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover border-2 border-orange-200"
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            )}
            <h1 className="text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent truncate">
              {shopName}
            </h1>
          </div>

          {/* Right Side - Auth & Account */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {loading ? (
              <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
            ) : user ? (
              <>
                {/* Owner Analytics Button */}
                {isOwner && onShowAnalytics && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onShowAnalytics}
                    className="hidden sm:flex items-center gap-1.5 text-xs h-8"
                  >
                    <BarChart3 className="w-3 h-3" />
                    Analytics
                  </Button>
                )}

                {/* Visible Account Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 px-2 sm:px-3 border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                  onClick={handleNavigateToAccount}
                >
                  <User className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Account</span>
                </Button>

                {/* Visible Orders Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 px-2 sm:px-3 border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                  onClick={handleNavigateToOrders}
                >
                  <ShoppingBag className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Orders</span>
                </Button>

                {/* Account Menu - Compact on mobile */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-9 sm:w-9 p-0 rounded-full">
                      <Avatar className="h-7 w-7 sm:h-9 sm:w-9">
                        <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.full_name || user?.email} />
                        <AvatarFallback className="bg-orange-500 text-white text-[10px] sm:text-xs font-semibold">
                          {userProfile?.full_name 
                            ? userProfile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                            : getInitials(user?.email || 'U')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {user.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    {/* Show in dropdown on desktop, hidden on mobile since buttons are visible */}
                    <DropdownMenuItem onClick={handleNavigateToAccount} className="hidden sm:flex">
                      <User className="w-4 h-4 mr-2" />
                      Account
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleNavigateToOrders} className="hidden sm:flex">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      My Orders
                    </DropdownMenuItem>
                    {isOwner && (
                      <>
                        <DropdownMenuSeparator />
                        {onShowAnalytics && (
                          <DropdownMenuItem onClick={onShowAnalytics}>
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Analytics
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={handleDashboard}>
                          <Settings className="w-4 h-4 mr-2" />
                          Store Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          const dashboardUrl = shopType === 'affiliate' 
                            ? 'https://flamia.store/affiliate/dashboard'
                            : 'https://flamia.store/seller/dashboard';
                          window.location.href = dashboardUrl;
                        }}>
                          <Settings className="w-4 h-4 mr-2" />
                          Main Dashboard
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {/* Sign In Button */}
                <Button 
                  variant="default" 
                  size="sm" 
                  type="button"
                  className="text-xs sm:text-sm h-8 sm:h-9 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md cursor-pointer"
                  onClick={handleSignIn}
                >
                  <LogIn className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

