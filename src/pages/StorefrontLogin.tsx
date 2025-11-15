import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Store, Mail, Lock, Chrome } from 'lucide-react';
import { toast } from 'sonner';

export default function StorefrontLogin() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [shopName, setShopName] = useState('');
  const [shopLogo, setShopLogo] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  const returnTo = searchParams.get('return_to');
  const shopType = searchParams.get('type') || 'seller';

  // Fetch shop details
  useEffect(() => {
    const fetchShopDetails = async () => {
      if (!slug) return;

      const table = shopType === 'affiliate' ? 'affiliate_shops' : 'seller_shops';
      const { data, error } = await supabase
        .from(table)
        .select('shop_name, logo_url, owner_id')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast.error('Shop not found');
        return;
      }

      setShopName(data.shop_name);
      setShopLogo(data.logo_url);
    };

    fetchShopDetails();
  }, [slug, shopType]);

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && returnTo) {
        // Already logged in, redirect back
        window.location.href = returnTo;
      }
    };
    checkAuth();
  }, [returnTo]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Set session persistence based on remember me
      await supabase.auth.setSession({
        access_token: '',
        refresh_token: ''
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('flamia_remember_me', 'true');
      } else {
        localStorage.removeItem('flamia_remember_me');
        // For non-remembered sessions, we could implement shorter session timeout
      }

      toast.success('Logged in successfully!');

      // Redirect to return URL or storefront
      if (returnTo) {
        window.location.href = returnTo;
      } else {
        const storefrontUrl = shopType === 'affiliate' 
          ? `/affiliate/${slug}`
          : `/shop/${slug}`;
        navigate(storefrontUrl);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      // Store remember me preference before OAuth redirect
      if (rememberMe) {
        localStorage.setItem('flamia_remember_me', 'true');
      } else {
        localStorage.removeItem('flamia_remember_me');
      }
      
      // Build redirect URL to come back to this storefront
      const redirectUrl = returnTo || window.location.origin + (
        shopType === 'affiliate' ? `/affiliate/${slug}` : `/shop/${slug}`
      );

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?return_to=${encodeURIComponent(redirectUrl)}`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Failed to log in with Google');
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);

    try {
      // Store remember me preference before magic link
      if (rememberMe) {
        localStorage.setItem('flamia_remember_me', 'true');
      } else {
        localStorage.removeItem('flamia_remember_me');
      }

      const redirectUrl = returnTo || window.location.origin + (
        shopType === 'affiliate' ? `/affiliate/${slug}` : `/shop/${slug}`
      );

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) throw error;

      toast.success('Magic link sent! Check your email');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            {shopLogo ? (
              <img 
                src={shopLogo} 
                alt={shopName}
                className="w-20 h-20 rounded-full object-cover border-4 border-orange-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Store className="w-10 h-10 text-white" />
              </div>
            )}
            <div className="text-center">
              <CardTitle className="text-2xl font-bold">
                {shopName || 'Store Login'}
              </CardTitle>
              <CardDescription className="mt-2">
                Sign in to access your store
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Remember Me for all methods */}
          <div className="flex items-center space-x-2 bg-orange-50 p-3 rounded-lg border border-orange-200">
            <input
              type="checkbox"
              id="remember-global"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-orange-600 bg-white border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
            />
            <Label 
              htmlFor="remember-global" 
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              Keep me signed in for 30 days
            </Label>
          </div>

          {/* Google Login */}
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm"
            variant="outline"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Chrome className="w-5 h-5 mr-2" />
            )}
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          {/* Email/Password Login */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Magic Link Option */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or use magic link</span>
            </div>
          </div>

          <Button
            onClick={handleMagicLink}
            disabled={loading || !email}
            variant="outline"
            className="w-full"
          >
            Send Magic Link
          </Button>

          {/* Links */}
          <div className="text-center space-y-2 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a 
                href={`https://flamia.store/${shopType === 'affiliate' ? 'affiliate' : 'sell'}`}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Sign up
              </a>
            </p>
            <p className="text-sm text-gray-600">
              <a 
                href="/reset-password"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Forgot password?
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-4 text-center w-full">
        <p className="text-xs text-gray-500">
          Powered by{' '}
          <a 
            href="https://flamia.store" 
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Flamia
          </a>
        </p>
      </div>
    </div>
  );
}

