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
  shopLogoUrl?: string;
  isOwner: boolean;
  shopType?: 'seller' | 'affiliate';
  onShowAnalytics?: () => void;
}

export const StorefrontHeader = ({ 
  shopName, 
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

  if (loading) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 via-white to-orange-50 sticky top-0 z-50 shadow-md">
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
            {user ? (
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
                        <DropdownMenuItem onClick={onShowAnalytics}>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          const dashboardUrl = shopType === 'affiliate' 
                            ? 'https://flamia.store/affiliate/dashboard'
                            : 'https://flamia.store/seller/dashboard';
                          window.location.href = dashboardUrl;
                        }}>
                          <Settings className="w-4 h-4 mr-2" />
                          Dashboard
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
                {/* Sign In with Google Button */}
                <Button 
                  variant="default" 
                  size="sm" 
                  className="text-xs sm:text-sm h-8 sm:h-9 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md"
                  onClick={handleGoogleSignIn}
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <LogIn className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

