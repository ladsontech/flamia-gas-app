import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Check, AlertCircle, Search } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  selectedLocation?: { lat: number; lng: number; address: string } | null;
}

export const LocationPicker = ({ onLocationSelect, selectedLocation }: LocationPickerProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 0.3476, lng: 32.5825 }, // Kampala coordinates
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      setMap(mapInstance);

      // Add click listener to map
      mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          handleLocationSelect(lat, lng);
        }
      });
    };

    const loadGoogleMaps = async () => {
      try {
        // Fetch API key from edge function
        const { data, error } = await supabase.functions.invoke('get-maps-api-key');
        
        if (error || !data?.apiKey) {
          setError('Google Maps API key not available');
          return;
        }

        // Load Google Maps API
        if (!window.google) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=geometry,places`;
          script.async = true;
          script.defer = true;
          script.onload = initMap;
          script.onerror = () => setError('Failed to load Google Maps');
          document.head.appendChild(script);
        } else {
          initMap();
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setError('Failed to load Google Maps');
      }
    };

    loadGoogleMaps();
  }, []);

  // Initialize Places Autocomplete
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places && searchInputRef.current) {
      const autocompleteInstance = new window.google.maps.places.Autocomplete(searchInputRef.current, {
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'ug' }, // Restrict to Uganda
        fields: ['place_id', 'geometry', 'name', 'formatted_address', 'address_components']
      });

      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace();
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address || place.name || '';
          handleLocationSelect(lat, lng, address);
        }
      });

      setAutocomplete(autocompleteInstance);
    }
  }, [map]);

  const handleLocationSelect = async (lat: number, lng: number, providedAddress?: string) => {
    try {
      // Update marker position
      if (marker) {
        marker.setPosition({ lat, lng });
      } else if (map) {
        const newMarker = new window.google.maps.Marker({
          position: { lat, lng },
          map: map,
          title: 'Delivery Location',
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
    } catch (error) {
      console.error('Error selecting location:', error);
      setError('Failed to select location');
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        handleLocationSelect(lat, lng);
        setLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError("Unable to get your location. Please select manually on the map.");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  return (
    <div className="space-y-3">
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

        <div className="h-48 rounded-md overflow-hidden border">
          <div ref={mapRef} className="w-full h-full" />
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Search above or click on the map to select your delivery location
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
            <p className="text-xs text-green-700">{selectedLocation.address}</p>
          </motion.div>
        )}
      </Card>
    </div>
  );
};
