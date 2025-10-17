import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Navigation, Search, AlertCircle, Check, Loader2, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface PlaceSearchProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  selectedLocation?: { lat: number; lng: number; address: string } | null;
}

interface NearbyPlace {
  name: string;
  vicinity: string;
  geometry: {
    location: google.maps.LatLng;
  };
  types?: string[];
}

export const PlaceSearch: React.FC<PlaceSearchProps> = ({ 
  onLocationSelect, 
  selectedLocation 
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [showingNearby, setShowingNearby] = useState(false);

  const loadGoogleMaps = async () => {
    try {
      console.log('Loading Google Maps API...');
      
      const { data, error } = await supabase.functions.invoke('get-maps-api-key');
      
      if (error || !data?.apiKey) {
        console.error('Google Maps API key error:', error);
        setError('Google Maps API key not available');
        return;
      }

      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          console.log('Google Maps loaded');
          setMapsLoaded(true);
        };
        
        script.onerror = (error) => {
          console.error('Failed to load Google Maps script:', error);
          setError('Failed to load Google Maps');
        };
        
        document.head.appendChild(script);
      } else {
        setMapsLoaded(true);
      }
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      setError('Failed to load Google Maps');
    }
  };

  useEffect(() => {
    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (mapsLoaded && window.google?.maps?.places && searchInputRef.current && !autocomplete) {
      console.log('Initializing Places Autocomplete...');
      
      try {
        const autocompleteInstance = new window.google.maps.places.Autocomplete(searchInputRef.current, {
          types: ['establishment', 'geocode'],
          componentRestrictions: { country: 'ug' },
          fields: ['place_id', 'geometry', 'name', 'formatted_address', 'address_components']
        });

        autocompleteInstance.addListener('place_changed', () => {
          const place = autocompleteInstance.getPlace();
          
          if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const address = place.formatted_address || place.name || '';
            console.log('Place selected:', { lat, lng, address });
            handleLocationSelect(lat, lng, address);
          }
        });

        setAutocomplete(autocompleteInstance);
      } catch (error) {
        console.error('Error initializing autocomplete:', error);
        setError('Failed to initialize place search');
      }
    }
  }, [mapsLoaded, autocomplete]);

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    onLocationSelect({ lat, lng, address });
    setShowingNearby(false);
    setNearbyPlaces([]);
    setError("");
  };

  const getCurrentLocationAndNearby = () => {
    console.log('Getting current location and nearby places...');
    setLoading(true);
    setError("");
    setShowingNearby(false);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        console.log('Current location obtained:', { lat, lng });
        
        // Get nearby places
        if (window.google && mapsLoaded) {
          const service = new google.maps.places.PlacesService(document.createElement('div'));
          const request = {
            location: new google.maps.LatLng(lat, lng),
            radius: 500, // 500 meters
            type: 'establishment'
          };

          service.nearbySearch(request, async (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              console.log('Found nearby places:', results.length);
              setNearbyPlaces(results.slice(0, 8) as NearbyPlace[]); // Show top 8
              setShowingNearby(true);
            } else {
              // If no nearby places found, just use current location
              const { GeocodingService } = await import('@/utils/geocoding');
              const address = await GeocodingService.reverseGeocode(lat, lng);
              handleLocationSelect(lat, lng, address);
            }
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = "Unable to get your location. ";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Please enable location permissions.";
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
        
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const selectNearbyPlace = (place: NearbyPlace) => {
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const address = `${place.name}, ${place.vicinity}`;
    handleLocationSelect(lat, lng, address);
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
              placeholder="Search for a place or landmark..."
              className="pl-10 h-9 text-sm"
            />
          </div>
          
          <Button
            type="button"
            onClick={getCurrentLocationAndNearby}
            disabled={loading}
            size="sm"
            className="w-full bg-accent hover:bg-accent/90 text-white h-8"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Finding nearby places...
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 mr-1" />
                Show Nearby Places
              </>
            )}
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

        <AnimatePresence>
          {showingNearby && nearbyPlaces.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <p className="text-xs font-medium text-muted-foreground">Select a nearby place:</p>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {nearbyPlaces.map((place, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    type="button"
                    onClick={() => selectNearbyPlace(place)}
                    className="w-full text-left p-3 rounded-lg border border-border hover:border-accent hover:bg-accent/5 transition-all"
                  >
                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{place.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{place.vicinity}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-xs text-muted-foreground text-center px-2">
          Search for a specific place or use "Show Nearby Places" to see locations near you
        </p>

        {selectedLocation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2 bg-green-50 border border-green-200 rounded-md"
          >
            <div className="flex items-center gap-2 mb-1">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Location Selected</span>
            </div>
            <p className="text-xs text-green-700 break-words">{selectedLocation.address}</p>
          </motion.div>
        )}
      </Card>
    </div>
  );
};
