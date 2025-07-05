import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AdminOrdersView } from "@/components/admin/AdminOrdersView";
import { OrderNotifications } from "@/components/admin/OrderNotifications";
import GadgetsManager from "@/components/admin/GadgetsManager";
import CarouselManager from "@/components/admin/CarouselManager";
import { fetchOrders, fetchDeliveryMen, verifyAdminPassword } from "@/services/database";
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  Users, 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  LogOut,
  Eye,
  EyeOff,
  Shield,
  Truck,
  MapPin,
  Phone,
  Calendar,
  Filter,
  Search,
  Download,
  Settings,
  ShoppingBag,
  Images
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, isAfter, isBefore } from "date-fns";

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateFilter, setDateFilter] = useState('today');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const { 
    data: orders = [], 
    isLoading: ordersLoading,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    enabled: authenticated,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const { 
    data: deliveryMen = [], 
    isLoading: deliveryMenLoading,
    refetch: refetchDeliveryMen
  } = useQuery({
    queryKey: ['deliveryMen'],
    queryFn: fetchDeliveryMen,
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
          title: "Welcome to Admin Dashboard",
          description: "Authentication successful"
        });
      } else {
        toast({
          title: "Authentication failed",
          description: "Invalid password. Please try again.",
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

  const handleLogout = () => {
    setAuthenticated(false);
    localStorage.removeItem('userRole');
    setPassword('');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully"
    });
  };

  const handleRefresh = () => {
    refetchOrders();
    refetchDeliveryMen();
    toast({
      title: "Data refreshed",
      description: "Latest data has been loaded"
    });
  };

  const handleNewOrder = () => {
    refetchOrders();
  };

  // Filter orders based on date and status
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    const today = new Date();
    
    // Date filter
    let dateMatch = true;
    switch (dateFilter) {
      case 'today':
        dateMatch = format(orderDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
        break;
      case 'week':
        dateMatch = isAfter(orderDate, subDays(today, 7));
        break;
      case 'month':
        dateMatch = isAfter(orderDate, subDays(today, 30));
        break;
    }
    
    // Status filter
    const statusMatch = statusFilter === 'all' || order.status === statusFilter;
    
    // Search filter
    const searchMatch = searchTerm === '' || 
      order.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return dateMatch && statusMatch && searchMatch;
  });

  // Calculate statistics
  const stats = {
    total: filteredOrders.length,
    pending: filteredOrders.filter(o => o.status === 'pending' || !o.status).length,
    assigned: filteredOrders.filter(o => o.status === 'assigned').length,
    inProgress: filteredOrders.filter(o => o.status === 'in_progress').length,
    completed: filteredOrders.filter(o => o.status === 'completed').length,
    revenue: filteredOrders.length * 45000, // Estimated average order value
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Admin Access
              </CardTitle>
              <p className="text-gray-600">
                Enter your admin password to access the dashboard
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter admin password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10 h-12 border-2 border-gray-200 focus:border-accent"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-semibold" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Access Dashboard"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Flamia Admin</h1>
                <p className="text-sm text-gray-600">Gas Delivery Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <OrderNotifications onNewOrder={handleNewOrder} />
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="h-9"
                disabled={ordersLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${ordersLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="h-9 text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="delivery" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Delivery
            </TabsTrigger>
            <TabsTrigger value="gadgets" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Gadgets
            </TabsTrigger>
            <TabsTrigger value="carousel" className="flex items-center gap-2">
              <Images className="h-4 w-4" />
              Carousel
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Total Orders</p>
                        <p className="text-3xl font-bold">{stats.total}</p>
                      </div>
                      <Package className="h-8 w-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100 text-sm font-medium">Pending</p>
                        <p className="text-3xl font-bold">{stats.pending}</p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-200" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Completed</p>
                        <p className="text-3xl font-bold">{stats.completed}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Revenue</p>
                        <p className="text-3xl font-bold">UGX {(stats.revenue / 1000000).toFixed(1)}M</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-12 bg-accent hover:bg-accent/90">
                    <Package className="h-4 w-4 mr-2" />
                    View All Orders
                  </Button>
                  <Button variant="outline" className="h-12">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Delivery Team
                  </Button>
                  <Button variant="outline" className="h-12">
                    <Download className="h-4 w-4 mr-2" />
                    Export Reports
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-gray-600">{format(new Date(order.created_at), 'MMM d, h:mm a')}</p>
                        </div>
                      </div>
                      <Badge variant={
                        order.status === 'completed' ? 'default' :
                        order.status === 'in_progress' ? 'secondary' :
                        order.status === 'assigned' ? 'outline' : 'destructive'
                      }>
                        {order.status || 'pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-full lg:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full lg:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Orders List */}
            {ordersLoading || deliveryMenLoading ? (
              <Card className="p-6">
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-accent" />
                  <span className="ml-3 text-gray-600">Loading orders...</span>
                </div>
              </Card>
            ) : (
              <AdminOrdersView 
                orders={filteredOrders} 
                deliveryMen={deliveryMen}
                onOrdersUpdate={handleRefresh} 
              />
            )}
          </TabsContent>

          {/* Delivery Tab */}
          <TabsContent value="delivery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Team Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {deliveryMen.map((deliveryMan) => (
                    <Card key={deliveryMan.id} className="border-2">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-accent" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{deliveryMan.name}</h3>
                            <p className="text-sm text-gray-600">{deliveryMan.email}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Active Orders:</span>
                            <Badge variant="secondary">
                              {orders.filter(o => o.delivery_man_id === deliveryMan.id && o.status !== 'completed').length}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Completed Today:</span>
                            <Badge variant="default">
                              {orders.filter(o => 
                                o.delivery_man_id === deliveryMan.id && 
                                o.status === 'completed' &&
                                format(new Date(o.created_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                              ).length}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gadgets Tab */}
          <TabsContent value="gadgets" className="space-y-6">
            <GadgetsManager />
          </TabsContent>

          {/* Carousel Tab */}
          <TabsContent value="carousel" className="space-y-6">
            <CarouselManager />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pending</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-500 rounded-full"
                            style={{ width: `${(stats.pending / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stats.pending}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Assigned</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(stats.assigned / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stats.assigned}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">In Progress</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-500 rounded-full"
                            style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stats.inProgress}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Completed</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stats.completed}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Completion Rate</span>
                        <span className="text-sm font-bold text-green-600">
                          {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full transition-all duration-500"
                          style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Active Delivery Rate</span>
                        <span className="text-sm font-bold text-blue-600">
                          {stats.total > 0 ? Math.round(((stats.assigned + stats.inProgress) / stats.total) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${stats.total > 0 ? ((stats.assigned + stats.inProgress) / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-accent">{deliveryMen.length}</p>
                          <p className="text-xs text-gray-600">Active Riders</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-accent">
                            {stats.total > 0 ? Math.round(stats.revenue / stats.total / 1000) : 0}K
                          </p>
                          <p className="text-xs text-gray-600">Avg Order Value</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;