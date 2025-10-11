
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
  CheckCircle,
  Truck,
  Map,
  LogOut
} from "lucide-react";
import Footer from "@/components/Footer";
import { Order } from "@/types/order";
import { fetchOrders, updateOrderStatus } from "@/services/database";
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getUserRole } from "@/services/adminService";

interface DeliveryOrder extends Order {
  customerName: string;
  customerPhone: string;
  displayAddress: string;
  estimatedTime: string;
}

const Delivery = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const mapRef = useRef<HTMLDivElement>(null);

  // Check authentication and role on mount
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signin');
        return;
      }
      
      const role = await getUserRole(user.id);
      
      if (!isMounted) return;
      
      if (role !== 'delivery_man') {
        toast({
          title: "Access Denied",
          description: "You don't have delivery permissions",
          variant: "destructive"
        });
        navigate('/signin');
        return;
      }
      
      setUserId(user.id);
      setUserName(user.email?.split('@')[0] || 'Delivery');
    };
    
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const { 
    data: orders = [], 
    isLoading,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ['deliveryOrders', userId],
    queryFn: fetchOrders,
    enabled: !!userId,
    select: (orders) => orders.filter((o) => o.delivery_man_id === userId),
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  // Convert orders to delivery orders format for map display
  const deliveryOrders: DeliveryOrder[] = orders.map((order, index) => ({
    ...order,
    customerName: `Customer ${index + 1}`,
    customerPhone: "+256700123456",
    displayAddress: order.delivery_address || "Address not available",
    estimatedTime: "30 mins"
  }));

  // Get location coordinates for map markers
  const getOrderLocation = (order: Order) => {
    if (order.delivery_latitude && order.delivery_longitude) {
      return {
        lat: Number(order.delivery_latitude),
        lng: Number(order.delivery_longitude)
      };
    }
    // Fallback to Kampala coordinates with slight randomization
    return {
      lat: 0.3136 + (Math.random() - 0.5) * 0.1,
      lng: 32.5811 + (Math.random() - 0.5) * 0.1
    };
  };

  // Initialize Google Maps
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 0.3476, lng: 32.5825 }, // Kampala coordinates
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        rotateControl: false,
        scaleControl: true,
        gestureHandling: 'greedy',
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        maxZoom: 20,
        minZoom: 10,
        styles: [
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#2d3748" }]
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#ffffff" }]
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#3B82F6" }, { weight: 4 }]
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#dbeafe" }]
          }
        ]
      });

      setMap(mapInstance);

      // Add markers for assigned orders
      deliveryOrders.forEach(order => {
        const orderLocation = getOrderLocation(order);
        
        const marker = new window.google.maps.Marker({
          position: orderLocation,
          map: mapInstance,
          title: `${order.customerName} - ${order.description}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#EF4444',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
            scale: 12
          }
        });

        marker.addListener('click', () => {
          setSelectedOrder(order);
          mapInstance.panTo(orderLocation);
        });
      });
    };

    const loadGoogleMaps = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-maps-api-key');
        
        if (error || !data?.apiKey) {
          console.error('Google Maps API key not available');
          return;
        }

        if (!window.google) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=geometry,places`;
          script.async = true;
          script.defer = true;
          script.onload = initMap;
          document.head.appendChild(script);
        } else {
          initMap();
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    loadGoogleMaps();
  }, [deliveryOrders]);

  // Real-time location tracking with route
  useEffect(() => {
    let watchId: number | null = null;
    let currentLocationMarker: google.maps.Marker | null = null;
    let routeRenderer: google.maps.DirectionsRenderer | null = null;

    const startLocationTracking = () => {
      if (navigator.geolocation && map) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setCurrentLocation(location);
            
            // Remove previous marker
            if (currentLocationMarker) {
              currentLocationMarker.setMap(null);
            }

            // Add current location marker (blue dot)
            currentLocationMarker = new window.google.maps.Marker({
              position: location,
              map: map,
              title: 'Your Location',
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#3B82F6',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 4,
                scale: 10
              },
              zIndex: 1000
            });

            // Show route to selected order
            if (selectedOrder) {
              const orderLocation = getOrderLocation(selectedOrder);
              const directionsService = new window.google.maps.DirectionsService();
              
              if (routeRenderer) {
                routeRenderer.setMap(null);
              }

              directionsService.route(
                {
                  origin: location,
                  destination: orderLocation,
                  travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                  if (status === 'OK') {
                    routeRenderer = new window.google.maps.DirectionsRenderer({
                      directions: result,
                      suppressMarkers: true,
                      polylineOptions: {
                        strokeColor: '#3B82F6',
                        strokeWeight: 5,
                        strokeOpacity: 0.8
                      }
                    });
                    routeRenderer.setMap(map);
                  }
                }
              );
            }
          },
          (error) => {
            console.error('Error tracking location:', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 1000
          }
        );
      }
    };

    if (map) {
      startLocationTracking();
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (currentLocationMarker) {
        currentLocationMarker.setMap(null);
      }
      if (routeRenderer) {
        routeRenderer.setMap(null);
      }
    };
  }, [map, selectedOrder]);

  const handleNavigate = (order: DeliveryOrder) => {
    const orderLocation = getOrderLocation(order);
    const destination = `${orderLocation.lat},${orderLocation.lng}`;
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    window.open(mapsUrl, '_blank');
  };

  const handleCallCustomer = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleUpdateOrderStatus = async (orderId: string, status: 'in_progress' | 'completed') => {
    try {
      await updateOrderStatus(orderId, status);
      toast({
        title: "Status Updated",
        description: `Order marked as ${status.replace('_', ' ')}`,
      });
      refetchOrders();
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Header - Mobile Optimized */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-3 py-2">
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600">
            <LogOut className="w-4 h-4" />
          </Button>
          <span className="text-xs sm:text-sm text-gray-700 font-medium truncate">{userName}</span>
          <Badge variant="secondary" className="text-xs">
            {deliveryOrders.length}
          </Badge>
        </div>
      </div>

      {/* Full Screen Map */}
      <div className="fixed inset-0 pt-12">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Floating Order Card */}
        {selectedOrder && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-4 left-4 right-4 z-40"
          >
            <Card className="bg-white shadow-2xl border-2 border-blue-500">
              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-gray-900 truncate">{selectedOrder.customerName}</h3>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{selectedOrder.description}</p>
                  </div>
                  <Badge className="text-xs shrink-0">
                    {selectedOrder.status?.replace('_', ' ') || 'assigned'}
                  </Badge>
                </div>
                
                <div className="flex items-start gap-1.5 text-xs text-gray-700">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-600" />
                  <span className="flex-1 line-clamp-2">{selectedOrder.displayAddress}</span>
                </div>
                
                {currentLocation && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-600">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Route shown</span>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => handleCallCustomer(selectedOrder.customerPhone)}
                    className="flex-1"
                  >
                    <Phone className="w-3.5 h-3.5 mr-1" />
                    Call
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleNavigate(selectedOrder)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Map className="w-3.5 h-3.5 mr-1" />
                    Maps
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  {selectedOrder.status === 'assigned' && (
                    <Button 
                      size="sm"
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'in_progress')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Truck className="w-3.5 h-3.5 mr-1" />
                      Start
                    </Button>
                  )}
                  {selectedOrder.status === 'in_progress' && (
                    <Button 
                      size="sm"
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'completed')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
        
        {/* Orders List Toggle Button */}
        <div className="absolute bottom-4 left-4 z-30">
          <Button
            size="sm"
            onClick={() => {
              // Cycle through orders
              const currentIndex = deliveryOrders.findIndex(o => o.id === selectedOrder?.id);
              const nextIndex = (currentIndex + 1) % deliveryOrders.length;
              setSelectedOrder(deliveryOrders[nextIndex] || null);
            }}
            className="bg-white hover:bg-gray-100 text-gray-900 shadow-xl"
            disabled={deliveryOrders.length === 0}
          >
            <Truck className="w-3.5 h-3.5 mr-1" />
            <span className="text-xs">{selectedOrder ? 'Next' : 'Orders'}</span>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Delivery;
