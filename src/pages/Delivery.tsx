
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
  Map,
  LogOut
} from "lucide-react";
import { BackButton } from "@/components/BackButton";
import Footer from "@/components/Footer";
import { Order } from "@/types/order";
import { fetchOrders, updateOrderStatus } from "@/services/database";
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GeocodingService } from "@/utils/geocoding";

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
  const [deliveryMan, setDeliveryMan] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Check authentication on mount
  useEffect(() => {
    const deliveryManData = localStorage.getItem('deliveryMan');
    const userRole = localStorage.getItem('userRole');
    
    if (!deliveryManData || userRole !== 'delivery') {
      navigate('/delivery-login');
      return;
    }
    
    setDeliveryMan(JSON.parse(deliveryManData));
  }, [navigate]);

  const { 
    data: orders = [], 
    isLoading,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ['deliveryOrders'],
    queryFn: fetchOrders,
    enabled: !!deliveryMan,
    select: (orders) => orders.filter((o) => o.delivery_man_id === deliveryMan?.id),
  });

  const handleLogout = () => {
    localStorage.removeItem('deliveryMan');
    localStorage.removeItem('userRole');
    navigate('/delivery-login');
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
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        rotateControl: true,
        scaleControl: true,
        gestureHandling: 'cooperative',
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        maxZoom: 20,
        minZoom: 8,
        styles: [
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#2d3748" }]
          },
          {
            featureType: "all",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#ffffff" }, { weight: 3 }]
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#ffffff" }]
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#e2e8f0" }, { weight: 1 }]
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#ffffff" }]
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#2563eb" }, { weight: 4 }]
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#1e40af" }]
          },
          {
            featureType: "road.arterial",
            elementType: "geometry",
            stylers: [{ color: "#ffffff" }]
          },
          {
            featureType: "road.arterial",
            elementType: "geometry.stroke",
            stylers: [{ color: "#cbd5e0" }, { weight: 2 }]
          },
          {
            featureType: "road.local",
            elementType: "geometry",
            stylers: [{ color: "#f7fafc" }]
          },
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "on" }]
          },
          {
            featureType: "poi.business",
            elementType: "labels",
            stylers: [{ visibility: "simplified" }]
          },
          {
            featureType: "transit",
            elementType: "labels",
            stylers: [{ visibility: "on" }]
          },
          {
            featureType: "transit.line",
            elementType: "geometry",
            stylers: [{ color: "#e2e8f0" }]
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#dbeafe" }]
          },
          {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ color: "#f9fafb" }]
          },
          {
            featureType: "landscape.natural",
            elementType: "geometry",
            stylers: [{ color: "#f0fdf4" }]
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
            url: order.status === 'assigned' ? 
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNGRjREMDAiLz4KPC9zdmc+' :
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMxMEI5ODEiLz4KPC9zdmc+',
            scaledSize: new window.google.maps.Size(30, 30)
          }
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px;">
              <h3 style="margin: 0 0 5px 0; font-weight: bold;">${order.customerName}</h3>
              <p style="margin: 0 0 5px 0;">${order.description}</p>
              <p style="margin: 0; color: #666;">${order.displayAddress}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker);
          setSelectedOrder(order);
        });
      });
    };

    const loadGoogleMaps = async () => {
      try {
        // Fetch API key from edge function
        const { data, error } = await supabase.functions.invoke('get-maps-api-key');
        
        if (error || !data?.apiKey) {
          console.error('Google Maps API key not available');
          return;
        }

        // Load Google Maps API
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

  // Real-time location tracking
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
            
            // Remove previous current location marker
            if (currentLocationMarker) {
              currentLocationMarker.setMap(null);
            }

            // Add updated current location marker
            currentLocationMarker = new window.google.maps.Marker({
              position: location,
              map: map,
              title: 'Your Current Location',
              icon: {
                url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIgZmlsbD0iIzNCODJGNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMyIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4K',
                scaledSize: new window.google.maps.Size(24, 24)
              },
              zIndex: 1000
            });

            // If there's a selected order, show route
            if (selectedOrder) {
              const orderLocation = getOrderLocation(selectedOrder);
              const directionsService = new window.google.maps.DirectionsService();
              
              // Remove previous route
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
                      suppressMarkers: true, // We have custom markers
                      polylineOptions: {
                        strokeColor: '#3B82F6',
                        strokeWeight: 4,
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

  if (!deliveryMan) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Top Header - Fixed */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <BackButton />
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 font-medium">Welcome, {deliveryMan.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Layout - Full Screen */}
      <div className="flex h-screen pt-16">
        {/* Orders Sidebar - Fixed width */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              Your Orders ({deliveryOrders.length})
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-gray-600">Loading orders...</p>
              </div>
            ) : deliveryOrders.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-gray-600">No orders assigned</p>
              </div>
            ) : (
              deliveryOrders.map((order) => (
                <Card key={order.id} className={`p-3 hover:shadow-md transition-all cursor-pointer border-2 ${
                  selectedOrder?.id === order.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                      onClick={() => setSelectedOrder(order)}>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{order.customerName}</h3>
                        <p className="text-xs text-gray-600 line-clamp-2">{order.description}</p>
                      </div>
                      <Badge className="ml-2 text-xs">
                        {order.status?.replace('_', ' ') || 'assigned'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{order.displayAddress}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span>ETA: {order.estimatedTime}</span>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCallCustomer(order.customerPhone);
                        }}
                        className="flex-1 h-7 text-xs"
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
                        className="flex-1 h-7 text-xs bg-blue-600 hover:bg-blue-700"
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        Navigate
                      </Button>
                    </div>
                    
                    <div className="flex gap-1">
                      {order.status === 'assigned' && (
                        <Button 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateOrderStatus(order.id, 'in_progress');
                          }}
                          className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Start
                        </Button>
                      )}
                      {order.status === 'in_progress' && (
                        <Button 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateOrderStatus(order.id, 'completed');
                          }}
                          className="flex-1 h-7 text-xs bg-blue-600 hover:bg-blue-700"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Map - Full Screen */}
        <div className="flex-1 relative">
          <div 
            ref={mapRef} 
            className="w-full h-full"
          />
          
          {/* Selected Order Info Overlay */}
          {selectedOrder && (
            <div className="absolute top-4 left-4 right-4 z-10">
              <Card className="p-4 bg-white/95 backdrop-blur-sm shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{selectedOrder.customerName}</h3>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrder.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedOrder.displayAddress}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <Phone className="w-4 h-4" />
                      <span>{selectedOrder.customerPhone}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCallCustomer(selectedOrder.customerPhone)}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleNavigate(selectedOrder)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Navigate
                    </Button>
                  </div>
                </div>
                
                {currentLocation && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-blue-700 font-medium">Live tracking active</span>
                      <span className="text-blue-600">• Route displayed on map</span>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}
          
          {/* Current Location Indicator */}
          {currentLocation && !selectedOrder && (
            <div className="absolute top-4 left-4 z-10">
              <Card className="p-3 bg-white/95 backdrop-blur-sm shadow-lg">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-700 font-medium">Your location is being tracked</span>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Delivery;
