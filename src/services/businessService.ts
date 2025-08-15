
import { supabase } from "@/integrations/supabase/client";
import { Business, BusinessProduct } from "@/types/business";

export const fetchBusinesses = async (): Promise<Business[]> => {
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
  
  return data as Business[] || [];
};

export const fetchBusinessProducts = async (businessId: string): Promise<BusinessProduct[]> => {
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
  
  return data as BusinessProduct[] || [];
};

export const createBusiness = async (business: Omit<Business, 'id' | 'created_at' | 'updated_at'>) => {
  const { error } = await supabase
    .from('businesses')
    .insert([business]);
  
  if (error) {
    console.error("Error creating business:", error);
    throw error;
  }
};

export const updateBusiness = async (id: string, updates: Partial<Business>) => {
  const { error } = await supabase
    .from('businesses')
    .update(updates)
    .eq('id', id);
  
  if (error) {
    console.error("Error updating business:", error);
    throw error;
  }
};

export const deleteBusiness = async (id: string) => {
  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting business:", error);
    throw error;
  }
};

export const createBusinessProduct = async (product: Omit<BusinessProduct, 'id' | 'created_at' | 'updated_at'>) => {
  const { error } = await supabase
    .from('business_products')
    .insert([product]);
  
  if (error) {
    console.error("Error creating business product:", error);
    throw error;
  }
};

export const updateBusinessProduct = async (id: string, updates: Partial<BusinessProduct>) => {
  const { error } = await supabase
    .from('business_products')
    .update(updates)
    .eq('id', id);
  
  if (error) {
    console.error("Error updating business product:", error);
    throw error;
  }
};

export const deleteBusinessProduct = async (id: string) => {
  const { error } = await supabase
    .from('business_products')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting business product:", error);
    throw error;
  }
};
