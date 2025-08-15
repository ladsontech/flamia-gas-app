
import { supabase } from "@/integrations/supabase/client";
import { Business, BusinessProduct } from "@/types/business";

export const fetchBusinesses = async (): Promise<Business[]> => {
  console.log("Fetching businesses...");
  
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('name');
    
    if (error) {
      console.error("Error fetching businesses:", error);
      // Try without any filters in case RLS is blocking
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('businesses')
        .select('*');
      
      if (fallbackError) {
        console.error("Fallback fetch also failed:", fallbackError);
        return [];
      }
      
      console.log("Fallback fetch successful:", fallbackData);
      return fallbackData as Business[] || [];
    }
    
    console.log("Fetched businesses successfully:", data);
    return data as Business[] || [];
  } catch (err) {
    console.error("Exception while fetching businesses:", err);
    return [];
  }
};

export const fetchBusinessProducts = async (businessId: string): Promise<BusinessProduct[]> => {
  console.log("Fetching products for business:", businessId);
  
  try {
    const { data, error } = await supabase
      .from('business_products')
      .select('*')
      .eq('business_id', businessId)
      .order('is_featured', { ascending: false })
      .order('name');
    
    if (error) {
      console.error("Error fetching business products:", error);
      // Try without availability filter
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('business_products')
        .select('*')
        .eq('business_id', businessId);
      
      if (fallbackError) {
        console.error("Fallback product fetch failed:", fallbackError);
        return [];
      }
      
      console.log("Fallback product fetch successful:", fallbackData);
      return fallbackData as BusinessProduct[] || [];
    }
    
    console.log("Fetched products successfully:", data);
    return data as BusinessProduct[] || [];
  } catch (err) {
    console.error("Exception while fetching products:", err);
    return [];
  }
};

export const createBusiness = async (business: Omit<Business, 'id' | 'created_at' | 'updated_at'>) => {
  console.log("Creating business:", business);
  try {
    const { data, error } = await supabase
      .from('businesses')
      .insert([business])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating business:", error);
      throw error;
    }
    
    console.log("Business created successfully:", data);
    return data;
  } catch (err) {
    console.error("Exception while creating business:", err);
    throw err;
  }
};

export const updateBusiness = async (id: string, updates: Partial<Business>) => {
  console.log("Updating business:", id, updates);
  try {
    const { error } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      console.error("Error updating business:", error);
      throw error;
    }
    
    console.log("Business updated successfully");
  } catch (err) {
    console.error("Exception while updating business:", err);
    throw err;
  }
};

export const deleteBusiness = async (id: string) => {
  console.log("Deleting business:", id);
  try {
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting business:", error);
      throw error;
    }
    
    console.log("Business deleted successfully");
  } catch (err) {
    console.error("Exception while deleting business:", err);
    throw err;
  }
};

export const createBusinessProduct = async (product: Omit<BusinessProduct, 'id' | 'created_at' | 'updated_at'>) => {
  console.log("Creating business product:", product);
  try {
    const { data, error } = await supabase
      .from('business_products')
      .insert([product])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating business product:", error);
      throw error;
    }
    
    console.log("Business product created successfully:", data);
    return data;
  } catch (err) {
    console.error("Exception while creating product:", err);
    throw err;
  }
};

export const updateBusinessProduct = async (id: string, updates: Partial<BusinessProduct>) => {
  console.log("Updating business product:", id, updates);
  try {
    const { error } = await supabase
      .from('business_products')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      console.error("Error updating business product:", error);
      throw error;
    }
    
    console.log("Business product updated successfully");
  } catch (err) {
    console.error("Exception while updating product:", err);
    throw err;
  }
};

export const deleteBusinessProduct = async (id: string) => {
  console.log("Deleting business product:", id);
  try {
    const { error } = await supabase
      .from('business_products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting business product:", error);
      throw error;
    }
    
    console.log("Business product deleted successfully");
  } catch (err) {
    console.error("Exception while deleting product:", err);
    throw err;
  }
};
