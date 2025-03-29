
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminOrdersView } from "@/components/admin/AdminOrdersView";
import { fetchOrders, verifyAdminPassword } from "@/services/database";
import { useQuery } from '@tanstack/react-query';

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { 
    data: orders = [], 
    isLoading: ordersLoading,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    enabled: authenticated,
  });

  // Check if already authenticated on mount
  useEffect(() => {
    const isAdmin = localStorage.getItem('userRole') === 'admin';
    if (isAdmin) {
      setAuthenticated(true);
    }
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const isValid = await verifyAdminPassword(password);
      
      if (isValid) {
        setAuthenticated(true);
        localStorage.setItem('userRole', 'admin');
        toast({ 
          title: "Authentication successful",
          description: "Welcome to the admin dashboard"
        });
      } else {
        toast({
          title: "Authentication failed",
          description: "Please check your password and try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Authentication error",
        description: "An error occurred during authentication",
        variant: "destructive"
      });
      console.error("Admin authentication error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (!authenticated) {
      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="w-full max-w-md p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Authenticating..." : "Login"}
              </Button>
            </form>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <AdminNav onRefresh={refetchOrders} />
        
        {ordersLoading ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">Loading orders...</p>
          </Card>
        ) : (
          <AdminOrdersView 
            orders={orders} 
            onOrdersUpdate={() => refetchOrders()} 
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default Admin;
