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
  Menu
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

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
  const [loading, setLoading] = useState(true);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setSignInOpen(false);
      setEmail('');
      setPassword('');
      await checkUser();
      toast({
        title: 'Signed in',
        description: 'Welcome back!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      setSignUpOpen(false);
      setEmail('');
      setPassword('');
      toast({
        title: 'Account created',
        description: 'Please check your email to verify your account.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo/Shop Name */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {shopLogoUrl ? (
              <img 
                src={shopLogoUrl} 
                alt={shopName}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover"
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-500/5 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
            )}
            <h1 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 truncate">
              {shopName}
            </h1>
          </div>

          {/* Right Side - Auth & Account */}
          <div className="flex items-center gap-2">
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

                {/* Account Menu */}
                <DropdownMenu open={accountMenuOpen} onOpenChange={setAccountMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
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
                {/* Sign In Button */}
                <Dialog open={signInOpen} onOpenChange={setSignInOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-xs sm:text-sm h-8 sm:h-9">
                      <LogIn className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Sign In
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Sign In</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={authLoading}>
                        {authLoading ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* Sign Up Button */}
                <Dialog open={signUpOpen} onOpenChange={setSignUpOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default" size="sm" className="text-xs sm:text-sm h-8 sm:h-9 bg-orange-500 hover:bg-orange-600">
                      Sign Up
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create Account</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          className="mt-1"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={authLoading}>
                        {authLoading ? 'Creating account...' : 'Sign Up'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

