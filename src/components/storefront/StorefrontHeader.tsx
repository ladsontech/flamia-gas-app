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
  BarChart3,
  Store
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
import { InstallButton } from './InstallButton';

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
      setLoading(false);
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
      // Navigate to direct storefront login page
      const returnTo = encodeURIComponent(window.location.href);
      if (shopSlug) {
        const loginUrl = shopType === 'affiliate'
          ? `/affiliate/${shopSlug}/login?return_to=${returnTo}&type=affiliate`
          : `/shop/${shopSlug}/login?return_to=${returnTo}&type=seller`;
        console.log('Navigating to:', loginUrl);
        navigate(loginUrl);
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
    <header className="bg-white sticky top-0 z-[100] border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Shop Name */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {shopLogoUrl ? (
              <img 
                src={shopLogoUrl} 
                alt={shopName}
                className="w-10 h-10 rounded-md object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-md bg-[#008060] flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
            )}
            <h1 className="text-lg font-semibold text-gray-900 truncate max-w-xs">
              {shopName}
            </h1>
          </div>

          {/* Right Side - Auth & Account */}
          <div className="flex items-center gap-3">
            {/* Install App Button */}
            <InstallButton 
              storeName={shopName}
              variant="outline"
              size="sm"
              className="hidden md:flex h-9 text-sm border-gray-300 hover:bg-gray-50 text-gray-700"
              showText={true}
            />
            
            {loading ? (
              <div className="h-9 w-24 bg-gray-100 animate-pulse rounded-md"></div>
            ) : user ? (
              <>
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-2">
                  {isOwner && onShowAnalytics && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onShowAnalytics}
                      className="h-9 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleNavigateToAccount}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Account
                  </Button>
                </div>

                {/* Account Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full hover:bg-gray-100">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.full_name || user?.email} />
                        <AvatarFallback className="bg-[#008060] text-white text-xs font-medium">
                          {userProfile?.full_name 
                            ? userProfile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                            : getInitials(user?.email || 'U')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleNavigateToAccount}>
                      <User className="w-4 h-4 mr-2" />
                      Account
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleNavigateToOrders}>
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
                {/* Sign In Button - Shopify style */}
                <Button 
                  variant="default" 
                  size="sm" 
                  type="button"
                  className="h-9 px-4 bg-[#008060] hover:bg-[#006e52] text-white font-medium text-sm"
                  onClick={handleSignIn}
                >
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

