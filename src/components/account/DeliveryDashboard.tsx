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
  Map
} from "lucide-react";
import { Order } from "@/types/order";
import { fetchOrders, updateOrderStatus } from "@/services/database";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

interface DeliveryOrder extends Order {
  customerName: string;
  customerPhone: string;
  displayAddress: string;
  estimatedTime: string;
}

interface DeliveryDashboardProps {
  userId: string;
}

export const DeliveryDashboard = ({ userId }: DeliveryDashboardProps) => {
  const { toast } = useToast();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const { 
    data: orders = [], 
    refetch: refetchOrders
  } = useQuery({
    queryKey: ['deliveryOrders', userId],
    queryFn: fetchOrders,
    enabled: !!userId,
    select: (orders) => orders.filter((o) => o.delivery_man_id === userId),
  });

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
  }, [deliveryOrders.length]);

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Delivery Dashboard</h2>
        <Badge variant="secondary">
          {deliveryOrders.length} Orders
        </Badge>
      </div>

      {deliveryOrders.length === 0 ? (
        <Card className="p-8 text-center">
          <Truck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Deliveries Assigned</h3>
          <p className="text-muted-foreground">You don't have any deliveries assigned yet.</p>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Orders List */}
          <div className="space-y-3 lg:max-h-[600px] lg:overflow-y-auto">
            <h3 className="text-lg font-semibold mb-3">Assigned Orders</h3>
            {deliveryOrders.map((order) => (
              <Card
                key={order.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedOrder?.id === order.id ? 'border-2 border-primary ring-2 ring-primary/20' : ''
                }`}
                onClick={() => {
                  setSelectedOrder(order);
                  if (map) {
                    const location = getOrderLocation(order);
                    map.panTo(location);
                    map.setZoom(16);
                  }
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-base">{order.customerName}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {order.description}
                      </p>
                    </div>
                    <Badge className="ml-2">
                      {order.status?.replace('_', ' ') || 'assigned'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-destructive" />
                    <span className="flex-1 text-muted-foreground line-clamp-2">
                      {order.displayAddress}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCallCustomer(order.customerPhone);
                      }}
                      className="flex-1"
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </Button>
                    <Button 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate(order);
                      }}
                      className="flex-1"
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      Navigate
                    </Button>
                  </div>

                  {order.status === 'assigned' && (
                    <Button 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateOrderStatus(order.id, 'in_progress');
                      }}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Truck className="w-3 h-3 mr-1" />
                      Start Delivery
                    </Button>
                  )}
                  {order.status === 'in_progress' && (
                    <Button 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateOrderStatus(order.id, 'completed');
                      }}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Complete Delivery
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Map Container */}
          <div className="relative h-[600px] rounded-lg overflow-hidden border-2 border-accent/20">
            <div ref={mapRef} className="w-full h-full" />
            
            {/* Selected Order Info Overlay */}
            {selectedOrder && currentLocation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-4 left-4 right-4 z-40"
              >
                <Card className="bg-white/95 backdrop-blur shadow-lg border">
                  <div className="p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Navigation className="w-4 h-4 text-primary" />
                      <span className="font-medium">Route shown to selected order</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};