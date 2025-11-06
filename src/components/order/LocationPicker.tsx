import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Navigation, Search, AlertCircle, Check } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  selectedLocation?: { lat: number; lng: number; address: string } | null;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationSelect, 
  selectedLocation 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mapsLoaded, setMapsLoaded] = useState(false);

  const initMap = () => {
    if (!mapRef.current) return;

    console.log('Initializing Google Map...');
    
    try {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 0.3476, lng: 32.5825 }, // Kampala coordinates
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        rotateControl: true,
        scaleControl: true,
        gestureHandling: 'cooperative',
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        maxZoom: 20,
        minZoom: 10,
        styles: [
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#333333" }]
          },
          {
            featureType: "all",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#ffffff" }, { weight: 2 }]
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#ffffff" }]
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#cccccc" }, { weight: 1 }]
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#ffffff" }]
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#2563eb" }, { weight: 3 }]
          },
          {
            featureType: "road.arterial",
            elementType: "geometry",
            stylers: [{ color: "#ffffff" }]
          },
          {
            featureType: "road.arterial",
            elementType: "geometry.stroke",
            stylers: [{ color: "#d1d5db" }, { weight: 2 }]
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
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#e0f2fe" }]
          },
          {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }]
          }
        ]
      });

      setMap(mapInstance);
      setMapsLoaded(true);

      // Add click listener to map
      mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          console.log('Map clicked at:', lat, lng);
          handleLocationSelect(lat, lng);
        }
      });

      console.log('Google Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Failed to initialize map');
    }
  };

  const loadGoogleMaps = async () => {
    try {
      console.log('Loading Google Maps API...');
      
      // Fetch API key from edge function
      const { data, error } = await supabase.functions.invoke('get-maps-api-key');
      
      if (error || !data?.apiKey) {
        console.error('Google Maps API key error:', error);
        setError('Google Maps API key not available');
        return;
      }

      console.log('Google Maps API key retrieved successfully');

      // Load Google Maps API
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=geometry,places&callback=initGoogleMaps`;
        script.async = true;
        script.defer = true;
        
        // Create global callback for Google Maps
        (window as any).initGoogleMaps = () => {
          console.log('Google Maps loaded via callback');
          initMap();
        };
        
        script.onerror = (error) => {
          console.error('Failed to load Google Maps script:', error);
          setError('Failed to load Google Maps');
        };
        
        document.head.appendChild(script);
      } else {
        console.log('Google Maps already loaded');
        initMap();
      }
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      setError('Failed to load Google Maps');
    }
  };

  // Initialize Google Maps
  useEffect(() => {
    loadGoogleMaps();
  }, []);

  // Initialize Places Autocomplete when map and input are ready
  useEffect(() => {
    if (mapsLoaded && window.google?.maps?.places && searchInputRef.current && !autocomplete) {
      console.log('Initializing Places Autocomplete...');
      
      try {
        const autocompleteInstance = new window.google.maps.places.Autocomplete(searchInputRef.current, {
          types: ['establishment', 'geocode'],
          componentRestrictions: { country: 'ug' }, // Restrict to Uganda
          fields: ['place_id', 'geometry', 'name', 'formatted_address', 'address_components']
        });

        autocompleteInstance.addListener('place_changed', () => {
          console.log('Place changed event triggered');
          const place = autocompleteInstance.getPlace();
          
          if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const address = place.formatted_address || place.name || '';
            console.log('Autocomplete selected place:', { lat, lng, address });
            handleLocationSelect(lat, lng, address);
          } else {
            console.warn('Place has no geometry');
          }
        });

        setAutocomplete(autocompleteInstance);
        console.log('Places Autocomplete initialized successfully');
      } catch (error) {
        console.error('Error initializing autocomplete:', error);
        setError('Failed to initialize place search');
      }
    }
  }, [mapsLoaded, autocomplete]);

  const handleLocationSelect = async (lat: number, lng: number, providedAddress?: string) => {
    try {
      console.log('Selecting location:', { lat, lng, providedAddress });
      
      // Update marker position
      if (marker) {
        marker.setPosition({ lat, lng });
      } else if (map) {
        const newMarker = new window.google.maps.Marker({
          position: { lat, lng },
          map: map,
          title: 'Delivery Location',
          draggable: true
        });
        
        // Make marker draggable
        newMarker.addListener('dragend', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const newLat = e.latLng.lat();
            const newLng = e.latLng.lng();
            console.log('Marker dragged to:', newLat, newLng);
            handleLocationSelect(newLat, newLng);
          }
        });
        
        setMarker(newMarker);
      }

      // Use provided address or get a readable place name from coordinates
      if (providedAddress) {
        onLocationSelect({ lat, lng, address: providedAddress });
      } else {
        // Use our enhanced geocoding service for better place names
        const { GeocodingService } = await import('@/utils/geocoding');
        const address = await GeocodingService.reverseGeocode(lat, lng);
        onLocationSelect({ lat, lng, address });
      }

      map?.panTo({ lat, lng });
      setError(""); // Clear any previous errors
    } catch (error) {
      console.error('Error selecting location:', error);
      setError('Failed to select location');
    }
  };

  const getCurrentLocation = () => {
    console.log('Getting current location...');
    setLoading(true);
    setError("");

    if (!navigator.geolocation) {
      const errorMsg = "Geolocation is not supported by this browser";
      console.error(errorMsg);
      setError(errorMsg);
      setLoading(false);
      return;
    }

    // Request permission explicitly
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'denied') {
        setError("Location permission denied. Please enable location access in your browser settings.");
        setLoading(false);
        return;
      }
      
      // Get current position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          console.log('Current location obtained:', { lat, lng });
          handleLocationSelect(lat, lng);
          setLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = "Unable to get your location. ";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Location access denied. Please enable location permissions in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage += "Location request timed out.";
              break;
            default:
              errorMessage += "An unknown error occurred.";
              break;
          }
          
          errorMessage += " Please select manually on the map.";
          setError(errorMessage);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    }).catch((error) => {
      console.error('Permission query error:', error);
      setError("Unable to check location permission. Please try selecting manually on the map.");
      setLoading(false);
    });
  };

  return (
    <div className="space-y-3 pb-4">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-4 h-4 text-accent" />
        <span className="text-sm font-medium">Delivery Location</span>
      </div>

      <Card className="p-3 space-y-3">
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              ref={searchInputRef}
              placeholder="Search for places (e.g., Kampala Central, Garden City Mall...)"
              className="pl-10 h-9 text-sm"
            />
          </div>
          
          <Button
            type="button"
            onClick={getCurrentLocation}
            disabled={loading}
            size="sm"
            className="w-full bg-accent hover:bg-accent/90 text-white h-8"
          >
            {loading ? (
              <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Navigation className="w-4 h-4 mr-1" />
            )}
            Use Current Location
          </Button>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md"
          >
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-xs text-red-600">{error}</span>
          </motion.div>
        )}

        <div className="h-48 sm:h-56 md:h-64 rounded-md overflow-hidden border bg-gray-100">
          <div ref={mapRef} className="w-full h-full" />
        </div>

        <p className="text-xs text-muted-foreground text-center px-2">
          Search above, click "Use Current Location", or click on the map to select your delivery location
        </p>

        {selectedLocation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2 bg-orange-50 border border-orange-200 rounded-md"
          >
            <div className="flex items-center gap-2 mb-1">
              <Check className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Location Selected</span>
            </div>
            <p className="text-xs text-orange-700 break-words">{selectedLocation.address}</p>
          </motion.div>
        )}
      </Card>
    </div>
  );
};