import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { LoginForm } from "@/components/admin/LoginForm";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { HotDealsManager } from "@/components/admin/HotDealsManager";
import { BrandsManager } from "@/components/admin/BrandsManager";
import { AdminNav } from "@/components/admin/AdminNav";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { AdminOrdersView } from "@/components/admin/AdminOrdersView";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'orders' | 'hotdeals' | 'brands' | 'accessories'>('orders');

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('email', session.user.email)
      .single();

    if (userData?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    setIsAuthenticated(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const { data, error } = await supabase
        .from('admin_credentials')
        .select('password_hash')
        .single();

      if (error) throw error;

      if (data.password_hash === password) {
        setIsAuthenticated(true);
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Invalid password",
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

  if (!isAuthenticated) {
    return (
      <LoginForm
        password={password}
        setPassword={setPassword}
        handleLogin={handleLogin}
        authLoading={authLoading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-white py-12">
      <div className="container">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-8">
          <span className="px-4 py-1 bg-accent text-accent-foreground rounded-full text-sm mb-4 inline-block">
            Admin Dashboard
          </span>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>

        <AdminNav activeSection={activeSection} onSectionChange={setActiveSection} />

        {activeSection === 'orders' && <AdminOrdersView />}
        {activeSection === 'hotdeals' && <HotDealsManager />}
        {activeSection === 'brands' && <BrandsManager />}
        {activeSection === 'accessories' && <div>Accessories Manager Coming Soon</div>}
      </div>
    </div>
  );
};

export default Admin;