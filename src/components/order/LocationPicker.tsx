
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Navigation, Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  selectedLocation?: { lat: number; lng: number; address: string } | null;
}

export const LocationPicker = ({ onLocationSelect, selectedLocation }: LocationPickerProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;

      const mapInstance = new google.maps.Map(mapRef.current, {
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

    // Load Google Maps API
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBmX_-2hCTJGYwUjs-6WKWumGyCVqPMZ0Y&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  const handleLocationSelect = async (lat: number, lng: number) => {
    try {
      // Update marker position
      if (marker) {
        marker.setPosition({ lat, lng });
      } else if (map) {
        const newMarker = new google.maps.Marker({
          position: { lat, lng },
          map: map,
          title: 'Delivery Location',
        });
        setMarker(newMarker);
      }

      // Get address from coordinates
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const address = results[0].formatted_address;
          onLocationSelect({ lat, lng, address });
        } else {
          onLocationSelect({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
        }
      });

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
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={getCurrentLocation}
            disabled={loading}
            size="sm"
            className="flex-1 bg-accent hover:bg-accent/90 text-white h-8"
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
          Click on the map to select your exact delivery location
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
            <p className="text-xs text-green-600 mt-1">
              Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </p>
          </motion.div>
        )}
      </Card>
    </div>
  );
};
