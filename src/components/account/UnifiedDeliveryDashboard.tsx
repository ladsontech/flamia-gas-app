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
  Package,
  TrendingUp,
  Clock
} from "lucide-react";
import { Order } from "@/types/order";
import { fetchOrders, updateOrderStatus } from "@/services/database";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isYesterday, parseISO } from "date-fns";

interface DeliveryOrder extends Order {
  customerName: string;
  customerPhone: string;
  displayAddress: string;
}

interface UnifiedDeliveryDashboardProps {
  userId: string;
}

export const UnifiedDeliveryDashboard = ({ userId }: UnifiedDeliveryDashboardProps) => {
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

  // Convert orders to delivery orders format and sort by date (newest first)
  const deliveryOrders: DeliveryOrder[] = orders
    .map((order) => {
      // Extract phone number from description if available (pattern: 07XXXXXXXX or +2567XXXXXXXX)
      const phoneMatch = order.description?.match(/(\+256|0)?7\d{8}/);
      const customerPhone = phoneMatch ? phoneMatch[0] : "+256700000000";
      
      return {
        ...order,
        customerName: "", // Will be set when grouping by date
        customerPhone,
        displayAddress: order.delivery_address || "Address not available",
      };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Calculate daily statistics (today only)
  const todaysOrders = deliveryOrders.filter(order => isToday(parseISO(order.created_at)));
  const completedDeliveries = todaysOrders.filter(o => o.status === 'completed').length;
  const inProgressDeliveries = todaysOrders.filter(o => o.status === 'in_progress').length;
  const pendingDeliveries = todaysOrders.filter(o => o.status === 'assigned').length;
  
  // Total all-time statistics
  const totalCompletedAllTime = deliveryOrders.filter(o => o.status === 'completed').length;

  // Group orders by date and assign order numbers for each day
  const groupOrdersByDate = (orders: DeliveryOrder[]) => {
    const groups: { [key: string]: DeliveryOrder[] } = {};
    
    orders.forEach(order => {
      const orderDate = parseISO(order.created_at);
      let dateLabel: string;
      
      if (isToday(orderDate)) {
        dateLabel = "Today";
      } else if (isYesterday(orderDate)) {
        dateLabel = "Yesterday";
      } else {
        dateLabel = format(orderDate, "EEEE, MMM d");
      }
      
      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(order);
    });
    
    // Assign order numbers for each day
    Object.keys(groups).forEach(dateLabel => {
      groups[dateLabel] = groups[dateLabel].map((order, index) => ({
        ...order,
        customerName: `Order ${index + 1}`
      }));
    });
    
    return groups;
  };

  const groupedOrders = groupOrdersByDate(deliveryOrders);

  // Get location coordinates for map markers
  const getOrderLocation = (order: Order) => {
    if (order.delivery_latitude && order.delivery_longitude) {
      return {
        lat: Number(order.delivery_latitude),
        lng: Number(order.delivery_longitude)
      };
    }
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
        center: { lat: 0.3476, lng: 32.5825 },
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#E67E22" }, { weight: 4 }]
          }
        ]
      });

      setMap(mapInstance);

      deliveryOrders.forEach(order => {
        const orderLocation = getOrderLocation(order);
        
        const marker = new window.google.maps.Marker({
          position: orderLocation,
          map: mapInstance,
          title: `${order.customerName} - ${order.description}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#E67E22',
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
            
            if (currentLocationMarker) {
              currentLocationMarker.setMap(null);
            }

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
                        strokeColor: '#E67E22',
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
    <div className="space-y-6">
      {/* Daily Statistics Header */}
      <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-100">Today's Performance</p>
              <p className="text-2xl font-bold mt-1">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Completed Today</p>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300 mt-2">{completedDeliveries}</p>
                <p className="text-xs text-muted-foreground mt-1">Total: {totalCompletedAllTime}</p>
              </div>
              <div className="h-12 w-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">In Progress Today</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-2">{inProgressDeliveries}</p>
                <p className="text-xs text-muted-foreground mt-1">Active deliveries</p>
              </div>
              <div className="h-12 w-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Pending Today</p>
                <p className="text-3xl font-bold text-amber-700 dark:text-amber-300 mt-2">{pendingDeliveries}</p>
                <p className="text-xs text-muted-foreground mt-1">Awaiting pickup</p>
              </div>
              <div className="h-12 w-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      {deliveryOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <Truck className="w-16 h-16 mx-auto mb-4 text-orange-400" />
          <h3 className="text-xl font-semibold mb-2">No Deliveries Assigned</h3>
          <p className="text-muted-foreground">You don't have any deliveries assigned yet.</p>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Orders List */}
          <div className="space-y-4 lg:max-h-[600px] lg:overflow-y-auto pr-2">
            {Object.entries(groupedOrders).map(([dateLabel, orders]) => (
              <div key={dateLabel} className="space-y-3">
                <h4 className="text-sm font-semibold text-orange-600 dark:text-orange-400 sticky top-0 bg-background py-2">
                  {dateLabel}
                </h4>
                {orders.map((order) => (
                  <Card
                    key={order.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-lg hover:border-orange-300 ${
                      selectedOrder?.id === order.id ? 'border-2 border-orange-500 ring-2 ring-orange-500/20' : ''
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
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-orange-500" />
                            <h4 className="font-semibold text-base">{order.customerName}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(parseISO(order.created_at), "h:mm a")}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Phone className="w-3 h-3 text-orange-500" />
                            <p className="text-sm font-medium text-foreground">
                              {order.customerPhone}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {order.description}
                          </p>
                          {order.total_amount && (
                            <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 mt-2">
                              UGX {order.total_amount.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <Badge className="ml-2 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                          {order.status?.replace('_', ' ') || 'assigned'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-orange-500" />
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
                          className="flex-1 border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-900/20"
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
                          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
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
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
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
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete Delivery
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ))}
          </div>

          {/* Map Container */}
          <div className="relative h-[600px] rounded-lg overflow-hidden border-2 border-orange-200 dark:border-orange-800">
            <div ref={mapRef} className="w-full h-full" />
            
            {selectedOrder && currentLocation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-4 left-4 right-4 z-40"
              >
                <Card className="bg-white/95 backdrop-blur shadow-lg border-orange-200">
                  <div className="p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Navigation className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">Route shown to selected order</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Daily Delivery Report Summary */}
      {todaysOrders.length > 0 && (
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-orange-500 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-orange-700 dark:text-orange-300">Today's Delivery Report</h3>
                <p className="text-sm text-orange-600 dark:text-orange-400">{format(new Date(), "MMMM d, yyyy")}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{completedDeliveries}</p>
                <p className="text-xs text-muted-foreground mt-1">Completed Today</p>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{inProgressDeliveries}</p>
                <p className="text-xs text-muted-foreground mt-1">In Progress</p>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingDeliveries}</p>
                <p className="text-xs text-muted-foreground mt-1">Pending</p>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{todaysOrders.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Today</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">All-Time Completed:</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">{totalCompletedAllTime} deliveries</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};