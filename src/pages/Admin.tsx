
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
import BusinessesManager from '@/components/admin/BusinessesManager';
import BusinessProductsManager from '@/components/admin/BusinessProductsManager';
import { verifyAdminPassword, fetchOrders, fetchDeliveryMen } from '@/services/database';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Order, DeliveryMan } from '@/types/order';

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryMen, setDeliveryMen] = useState<DeliveryMan[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is already authenticated in this session
    const adminAuth = sessionStorage.getItem('adminAuth');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
      loadOrdersAndDeliveryMen();
    }
  }, []);

  const loadOrdersAndDeliveryMen = async () => {
    try {
      const [ordersData, deliveryMenData] = await Promise.all([
        fetchOrders(),
        fetchDeliveryMen()
      ]);
      setOrders(ordersData);
      setDeliveryMen(deliveryMenData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleOrdersUpdate = () => {
    loadOrdersAndDeliveryMen();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isValid = await verifyAdminPassword(password);
      if (isValid) {
        setIsAuthenticated(true);
        sessionStorage.setItem('adminAuth', 'true');
        await loadOrdersAndDeliveryMen();
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
      
      <div className="container mx-auto p-2 sm:p-4 max-w-7xl">
        <Tabs defaultValue="orders" className="w-full">
          {/* Mobile-responsive tabs */}
          <div className="mb-4">
            <ScrollArea className="w-full">
              <TabsList className="grid grid-cols-7 w-full min-w-[600px] h-auto p-1 bg-muted rounded-lg">
                <TabsTrigger value="orders" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-background">
                  Orders
                </TabsTrigger>
                <TabsTrigger value="promotions" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-background">
                  Promos
                </TabsTrigger>
                <TabsTrigger value="gadgets" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-background">
                  Gadgets
                </TabsTrigger>
                <TabsTrigger value="brands" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-background">
                  Brands
                </TabsTrigger>
                <TabsTrigger value="carousel" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-background">
                  Carousel
                </TabsTrigger>
                <TabsTrigger value="businesses" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-background">
                  Business
                </TabsTrigger>
                <TabsTrigger value="products" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-background">
                  Products
                </TabsTrigger>
              </TabsList>
            </ScrollArea>
          </div>
          
          <div className="space-y-4">
            <TabsContent value="orders" className="mt-0">
              <AdminOrdersView orders={orders} deliveryMen={deliveryMen} onOrdersUpdate={handleOrdersUpdate} />
            </TabsContent>
            
            <TabsContent value="promotions" className="mt-0">
              <PromotionsManager />
            </TabsContent>
            
            <TabsContent value="gadgets" className="mt-0">
              <GadgetsManager />
            </TabsContent>
            
            <TabsContent value="brands" className="mt-0">
              <BrandsManager />
            </TabsContent>
            
            <TabsContent value="carousel" className="mt-0">
              <CarouselManager />
            </TabsContent>
            
            <TabsContent value="businesses" className="mt-0">
              <BusinessesManager />
            </TabsContent>
            
            <TabsContent value="products" className="mt-0">
              <BusinessProductsManager />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
