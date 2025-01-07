import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { User, LockKeyhole } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        navigate('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data: adminData, error: adminError } = await supabase
        .from('admin_credentials')
        .select('password_hash')
        .single();

      if (adminError) throw adminError;

      if (adminData.password_hash !== password || username !== 'admin') {
        toast({
          title: "Error",
          description: "Invalid admin credentials",
          variant: "destructive",
        });
        return;
      }

      const { data: { user }, error: signInError } = await supabase.auth.signUp({
        email: `admin_${Date.now()}@example.com`,
        password: password,
      });

      if (signInError) throw signInError;

      if (user) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ admin: 'admin' })
          .eq('id', user.id);

        if (updateError) throw updateError;

        localStorage.setItem('isAdmin', 'true');
        
        toast({
          title: "Success",
          description: "Logged in as admin",
        });

        navigate('/admin');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Failed to login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/20 to-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        <Card className="p-6">
          {isAdminMode ? (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Username (admin)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login as Admin"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsAdminMode(false)}
              >
                Back to User Login
              </Button>
            </form>
          ) : (
            <>
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  style: {
                    button: { background: 'hsl(142, 70%, 45%)', color: 'white' },
                    anchor: { color: 'hsl(142, 70%, 45%)' },
                  },
                  variables: {
                    default: {
                      colors: {
                        brand: 'hsl(142, 70%, 45%)',
                        brandAccent: 'hsl(142, 70%, 40%)',
                      },
                    },
                  },
                }}
                providers={[]}
                view="sign_in"
                showLinks={true}
                redirectTo={window.location.origin}
              />
              
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => setIsAdminMode(true)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <LockKeyhole className="w-4 h-4" />
                  Admin Login
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Login;