
import { supabase } from "@/integrations/supabase/client";
import { Business, BusinessProduct } from "@/types/business";

export const fetchBusinesses = async (): Promise<Business[]> => {
  console.log("Fetching businesses...");
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('name');
  
  if (error) {
    console.error("Error fetching businesses:", error);
    return [];
  }
  
  console.log("Fetched businesses:", data);
  return data as Business[] || [];
};

export const fetchBusinessProducts = async (businessId: string): Promise<BusinessProduct[]> => {
  console.log("Fetching products for business:", businessId);
  const { data, error } = await supabase
    .from('business_products')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_available', true)
    .order('is_featured', { ascending: false })
    .order('name');
  
  if (error) {
    console.error("Error fetching business products:", error);
    return [];
  }
  
  console.log("Fetched products:", data);
  return data as BusinessProduct[] || [];
};

export const createBusiness = async (business: Omit<Business, 'id' | 'created_at' | 'updated_at'>) => {
  console.log("Creating business:", business);
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
};

export const updateBusiness = async (id: string, updates: Partial<Business>) => {
  console.log("Updating business:", id, updates);
  const { error } = await supabase
    .from('businesses')
    .update(updates)
    .eq('id', id);
  
  if (error) {
    console.error("Error updating business:", error);
    throw error;
  }
  
  console.log("Business updated successfully");
};

export const deleteBusiness = async (id: string) => {
  console.log("Deleting business:", id);
  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting business:", error);
    throw error;
  }
  
  console.log("Business deleted successfully");
};

export const createBusinessProduct = async (product: Omit<BusinessProduct, 'id' | 'created_at' | 'updated_at'>) => {
  console.log("Creating business product:", product);
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
};

export const updateBusinessProduct = async (id: string, updates: Partial<BusinessProduct>) => {
  console.log("Updating business product:", id, updates);
  const { error } = await supabase
    .from('business_products')
    .update(updates)
    .eq('id', id);
  
  if (error) {
    console.error("Error updating business product:", error);
    throw error;
  }
  
  console.log("Business product updated successfully");
};

export const deleteBusinessProduct = async (id: string) => {
  console.log("Deleting business product:", id);
  const { error } = await supabase
    .from('business_products')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting business product:", error);
    throw error;
  }
  
  console.log("Business product deleted successfully");
};
