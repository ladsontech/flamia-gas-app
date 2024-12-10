import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/admin/LoginForm";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        handleAuthStateChange('SIGNED_IN', session);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleAuthStateChange = async (event: string, session: any) => {
    if (event === 'SIGNED_IN' && session?.user) {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (userData?.role === 'admin') {
          navigate('/admin/brands');
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        navigate('/');
      }
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const { data, error } = await supabase
        .from('admin_credentials')
        .select('password_hash')
        .single();

      if (error) throw error;

      if (data.password_hash === adminPassword) {
        navigate('/admin/brands');
        toast({
          title: "Success",
          description: "Logged in as admin successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Invalid admin password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Authentication failed",
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  if (showAdminLogin) {
    return (
      <LoginForm
        password={adminPassword}
        setPassword={setAdminPassword}
        handleLogin={handleAdminLogin}
        authLoading={authLoading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-white py-12">
      <div className="container max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Login</h1>
            <Button
              variant="outline"
              onClick={() => setShowAdminLogin(true)}
              size="sm"
            >
              Admin Login
            </Button>
          </div>
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#000',
                    brandAccent: '#666',
                  },
                },
              },
            }}
            providers={[]}
            view="sign_in"
            showLinks={true}
            redirectTo={window.location.origin}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;