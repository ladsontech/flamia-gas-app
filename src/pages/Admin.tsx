
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminOrdersView } from "@/components/admin/AdminOrdersView";
import { fetchOrders, verifyAdminPassword } from "@/services/database";
import { useQuery } from '@tanstack/react-query';
import { Order } from '@/types/order';

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'orders' | 'hotdeals' | 'brands' | 'accessories'>('orders');
  const { toast } = useToast();
  const navigate = useNavigate();

  const { 
    data: orders = [], 
    isLoading: ordersLoading,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    enabled: authenticated,
  });

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const isValid = await verifyAdminPassword(password);
      
      if (isValid) {
        setAuthenticated(true);
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
        <AdminNav 
          activeSection={activeSection} 
          onSectionChange={(section) => setActiveSection(section)} 
        />
        
        {activeSection === 'orders' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">All Orders</h2>
              <Button 
                variant="outline" 
                onClick={() => refetchOrders()}
                disabled={ordersLoading}
              >
                Refresh
              </Button>
            </div>
            
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
        )}
        
        {activeSection === 'hotdeals' && (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">Hot Deals management will be implemented soon</p>
          </Card>
        )}
        
        {activeSection === 'brands' && (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">Brands management will be implemented soon</p>
          </Card>
        )}
        
        {activeSection === 'accessories' && (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">Accessories management will be implemented soon</p>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Flamia Admin</h1>
          {authenticated && (
            <Button variant="ghost" onClick={() => navigate('/')}>
              Back to Website
            </Button>
          )}
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
};

export default Admin;
