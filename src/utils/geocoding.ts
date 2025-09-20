import { supabase } from "@/integrations/supabase/client";

export class GeocodingService {
  private static async getGoogleMapsApiKey(): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('get-maps-api-key');
      if (error || !data?.apiKey) {
        console.error('Google Maps API key not available');
        return null;
      }
      return data.apiKey;
    } catch (error) {
      console.error('Error getting Google Maps API key:', error);
      return null;
    }
  }

  static async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const apiKey = await this.getGoogleMapsApiKey();
      if (!apiKey) {
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        // Try to find a good address format
        const result = data.results[0];
        
        // Look for a formatted address that's not too long
        const addressComponents = result.address_components || [];
        const route = addressComponents.find((c: any) => c.types.includes('route'))?.long_name;
        const locality = addressComponents.find((c: any) => c.types.includes('locality'))?.long_name;
        const sublocality = addressComponents.find((c: any) => c.types.includes('sublocality'))?.long_name;
        
        if (route && (locality || sublocality)) {
          return `${route}, ${locality || sublocality}`;
        }
        
        // Fallback to formatted address but trim if too long
        let formattedAddress = result.formatted_address;
        if (formattedAddress.length > 50) {
          const parts = formattedAddress.split(',');
          formattedAddress = parts.slice(0, 2).join(',');
        }
        
        return formattedAddress;
      }
      
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }
}