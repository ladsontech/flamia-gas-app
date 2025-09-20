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
        return `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        // Prioritize different address types for better readability
        for (const result of data.results) {
          const addressComponents = result.address_components || [];
          
          // Look for establishments or points of interest first
          if (result.types.includes('establishment') || result.types.includes('point_of_interest')) {
            const name = addressComponents.find((c: any) => c.types.includes('establishment'))?.long_name;
            const locality = addressComponents.find((c: any) => c.types.includes('locality') || c.types.includes('sublocality'))?.long_name;
            
            if (name && locality) {
              return `${name}, ${locality}`;
            }
          }
        }
        
        // If no establishment found, look for street address
        const mainResult = data.results[0];
        const addressComponents = mainResult.address_components || [];
        
        const route = addressComponents.find((c: any) => c.types.includes('route'))?.long_name;
        const locality = addressComponents.find((c: any) => c.types.includes('locality'))?.long_name;
        const sublocality = addressComponents.find((c: any) => 
          c.types.includes('sublocality') || c.types.includes('sublocality_level_1')
        )?.long_name;
        const neighborhood = addressComponents.find((c: any) => c.types.includes('neighborhood'))?.long_name;
        
        // Build a readable address
        if (route && (locality || sublocality)) {
          return `${route}, ${locality || sublocality}`;
        } else if (sublocality && locality) {
          return `${sublocality}, ${locality}`;
        } else if (neighborhood && locality) {
          return `${neighborhood}, ${locality}`;
        } else if (locality) {
          return locality;
        }
        
        // Last fallback - use formatted address but make it cleaner
        let formattedAddress = mainResult.formatted_address;
        
        // Remove country and postal codes for cleaner display
        formattedAddress = formattedAddress
          .replace(/,\s*Uganda\s*/gi, '')
          .replace(/,\s*\d{5,}\s*/g, '');
        
        // Limit length
        if (formattedAddress.length > 60) {
          const parts = formattedAddress.split(',');
          formattedAddress = parts.slice(0, 2).join(',').trim();
        }
        
        return formattedAddress || `Location near ${locality || 'Kampala'}`;
      }
      
      return `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }
}