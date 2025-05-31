
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Truck,
  Map
} from "lucide-react";
import { BackButton } from "@/components/BackButton";
import Footer from "@/components/Footer";

interface DeliveryOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  location: { lat: number; lng: number };
  orderDetails: string;
  status: 'pending' | 'in-progress' | 'delivered';
  estimatedTime: string;
}

const Delivery = () => {
  const { toast } = useToast();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Sample delivery orders - in real app, this would come from your backend
  const [orders] = useState<DeliveryOrder[]>([
    {
      id: "1",
      customerName: "John Doe",
      customerPhone: "+256700123456",
      address: "Kampala Road, Kampala",
      location: { lat: 0.3136, lng: 32.5811 },
      orderDetails: "12KG Total Gas Cylinder",
      status: "pending",
      estimatedTime: "30 mins"
    },
    {
      id: "2",
      customerName: "Jane Smith",
      customerPhone: "+256700654321",
      address: "Ntinda, Kampala",
      location: { lat: 0.3676, lng: 32.6176 },
      orderDetails: "6KG Shell Gas Refill",
      status: "in-progress",
      estimatedTime: "15 mins"
    }
  ]);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 0.3476, lng: 32.5825 }, // Kampala coordinates
        zoom: 12,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      setMap(mapInstance);

      // Add markers for all pending orders
      orders.forEach(order => {
        const marker = new window.google.maps.Marker({
          position: order.location,
          map: mapInstance,
          title: `${order.customerName} - ${order.orderDetails}`,
          icon: {
            url: order.status === 'pending' ? 
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNGRjREMDAiLz4KPC9zdmc+' :
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMxMEI5ODEiLz4KPC9zdmc+',
            scaledSize: new window.google.maps.Size(30, 30)
          }
        });

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px;">
              <h3 style="margin: 0 0 5px 0; font-weight: bold;">${order.customerName}</h3>
              <p style="margin: 0 0 5px 0;">${order.orderDetails}</p>
              <p style="margin: 0; color: #666;">${order.address}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker);
          setSelectedOrder(order);
        });
      });
    };

    // Load Google Maps API
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD83MF_Ewc0_nljYC2HCPT-iggoW8fUaxM&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [orders]);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          
          // Add current location marker
          if (map) {
            new window.google.maps.Marker({
              position: location,
              map: map,
              title: 'Your Location',
              icon: {
                url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMzQjgyRjYiLz4KPC9zdmc+',
                scaledSize: new window.google.maps.Size(20, 20)
              }
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [map]);

  const handleNavigate = (order: DeliveryOrder) => {
    const destination = `${order.location.lat},${order.location.lng}`;
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    window.open(mapsUrl, '_blank');
  };

  const handleCallCustomer = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const updateOrderStatus = (orderId: string, status: 'pending' | 'in-progress' | 'delivered') => {
    // In real app, this would update the backend
    toast({
      title: "Status Updated",
      description: `Order marked as ${status}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container max-w-6xl px-3 py-6">
        <BackButton />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Delivery Dashboard</h1>
            <p className="text-gray-600">Manage your delivery routes and orders</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders List */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                Active Orders
              </h2>
              
              {orders.map((order) => (
                <Card key={order.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedOrder(order)}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{order.customerName}</h3>
                        <p className="text-sm text-gray-600">{order.orderDetails}</p>
                      </div>
                      <Badge variant={order.status === 'pending' ? 'destructive' : 
                                   order.status === 'in-progress' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{order.address}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>ETA: {order.estimatedTime}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCallCustomer(order.customerPhone);
                        }}
                        className="flex-1"
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigate(order);
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <Navigation className="w-4 h-4 mr-1" />
                        Navigate
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Map */}
            <div className="lg:col-span-2">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Map className="w-5 h-5 text-blue-600" />
                    Delivery Map
                  </h2>
                  {currentLocation && (
                    <Badge variant="outline" className="text-blue-600">
                      <MapPin className="w-3 h-3 mr-1" />
                      Live Location
                    </Badge>
                  )}
                </div>
                
                <div className="h-96 rounded-lg overflow-hidden border">
                  <div ref={mapRef} className="w-full h-full" />
                </div>
                
                {selectedOrder && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <h3 className="font-medium mb-2">Selected Order</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
                      <p><strong>Order:</strong> {selectedOrder.orderDetails}</p>
                      <p><strong>Address:</strong> {selectedOrder.address}</p>
                      <p><strong>Phone:</strong> {selectedOrder.customerPhone}</p>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      {selectedOrder.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateOrderStatus(selectedOrder.id, 'in-progress')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Start Delivery
                        </Button>
                      )}
                      {selectedOrder.status === 'in-progress' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Delivered
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Delivery;
