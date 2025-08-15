
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import AdminAppBar from '@/components/admin/AdminAppBar';
import { AdminOrdersView } from '@/components/admin/AdminOrdersView';
import BrandsManager from '@/components/admin/BrandsManager';
import GadgetsManager from '@/components/admin/GadgetsManager';
import CarouselManager from '@/components/admin/CarouselManager';
import PromotionsManager from '@/components/admin/PromotionsManager';
import { verifyAdminPassword } from '@/services/database';

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is already authenticated in this session
    const adminAuth = sessionStorage.getItem('adminAuth');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isValid = await verifyAdminPassword(password);
      if (isValid) {
        setIsAuthenticated(true);
        sessionStorage.setItem('adminAuth', 'true');
        toast({
          title: "Welcome Admin",
          description: "Successfully logged in to admin panel"
        });
      } else {
        toast({
          title: "Invalid Password",
          description: "Please enter the correct admin password",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An error occurred during login",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminAppBar onLogout={handleLogout} />
      
      <div className="container mx-auto p-4">
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="promotions">Promotions</TabsTrigger>
            <TabsTrigger value="gadgets">Gadgets</TabsTrigger>
            <TabsTrigger value="brands">Brands</TabsTrigger>
            <TabsTrigger value="carousel">Carousel</TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders">
            <AdminOrdersView orders={[]} deliveryMen={[]} onOrdersUpdate={() => {}} />
          </TabsContent>
          
          <TabsContent value="promotions">
            <PromotionsManager />
          </TabsContent>
          
          <TabsContent value="gadgets">
            <GadgetsManager />
          </TabsContent>
          
          <TabsContent value="brands">
            <BrandsManager />
          </TabsContent>
          
          <TabsContent value="carousel">
            <CarouselManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
