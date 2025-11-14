import { supabase } from "@/integrations/supabase/client";
import type { ProductCategory, SellerApplication, SellerShop } from "@/types/seller";
import type { Business } from "@/types/business";

// Fetch all product categories
export const fetchProductCategories = async (): Promise<ProductCategory[]> => {
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Fetch parent categories only
export const fetchParentCategories = async (): Promise<ProductCategory[]> => {
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .is('parent_id', null)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Fetch subcategories by parent
export const fetchSubcategories = async (parentId: string): Promise<ProductCategory[]> => {
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .eq('parent_id', parentId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Check if shop name is available (for both sellers and affiliates)
export const checkShopNameAvailability = async (shopName: string): Promise<boolean> => {
  // Check in seller shops
  const { data: sellerShops } = await supabase
    .from('seller_shops')
    .select('id')
    .ilike('shop_name', shopName)
    .limit(1);

  if (sellerShops && sellerShops.length > 0) return false;

  // Check in affiliate shops
  const { data: affiliateShops } = await supabase
    .from('affiliate_shops')
    .select('id')
    .ilike('shop_name', shopName)
    .limit(1);

  if (affiliateShops && affiliateShops.length > 0) return false;

  // Check in pending applications
  const { data: applications } = await supabase
    .from('seller_applications')
    .select('id')
    .ilike('shop_name', shopName)
    .eq('status', 'pending')
    .limit(1);

  if (applications && applications.length > 0) return false;

  return true;
};

// Create seller application
export const createSellerApplication = async (
  application: Omit<SellerApplication, 'id' | 'created_at' | 'updated_at' | 'status' | 'reviewed_by' | 'reviewed_at'>
): Promise<any> => {
  // Check name availability first
  const isAvailable = await checkShopNameAvailability(application.shop_name);
  if (!isAvailable) {
    throw new Error('This shop name is already taken. Please choose another name.');
  }

  const { data, error } = await supabase
    .from('seller_applications')
    .insert(application)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Generate unique shop slug
export const generateShopSlug = async (shopName: string): Promise<string> => {
  const baseSlug = shopName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const { data } = await supabase
      .from('seller_shops')
      .select('shop_slug')
      .eq('shop_slug', slug)
      .single();

    if (!data) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// Approve seller application and create shop
export const approveSellerApplication = async (
  applicationId: string,
  reviewNotes?: string
): Promise<void> => {
  // Get application details
  const { data: application, error: appError } = await supabase
    .from('seller_applications')
    .select('*')
    .eq('id', applicationId)
    .single();

  if (appError || !application) throw appError || new Error('Application not found');

  // Generate slug
  const shopSlug = await generateShopSlug(application.shop_name);

  // Create business
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .insert({
      name: application.shop_name,
      description: application.description,
      location: 'Uganda',
      contact: '',
      is_active: true,
      is_featured: false,
      owner_type: 'seller',
      category_id: application.category_id
    })
    .select()
    .single();

  if (businessError) throw businessError;

  // Calculate next payment due (30 days from now)
  const nextPaymentDue = new Date();
  nextPaymentDue.setDate(nextPaymentDue.getDate() + 30);

  // Create seller shop
  const { data: shop, error: shopError } = await supabase
    .from('seller_shops')
    .insert({
      user_id: application.user_id,
      business_id: business.id,
      application_id: applicationId,
      shop_name: application.shop_name,
      shop_slug: shopSlug,
      category_id: application.category_id,
      tier: 'basic',
      commission_enabled: true,
      is_active: true,
      is_approved: true,
      monthly_fee: 50000,
      next_payment_due: nextPaymentDue.toISOString(),
      shop_description: application.description
    })
    .select()
    .single();

  if (shopError) throw shopError;

  // Update business with shop_id
  await supabase
    .from('businesses')
    .update({ shop_id: shop.id })
    .eq('id', business.id);

  // Assign business_owner role
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({
      user_id: application.user_id,
      role: 'business_owner',
      business_id: business.id
    });

  if (roleError && !roleError.message.includes('duplicate')) {
    throw roleError;
  }

  // Update application status
  const { data: { user } } = await supabase.auth.getUser();
  await supabase
    .from('seller_applications')
    .update({
      status: 'approved',
      review_notes: reviewNotes,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', applicationId);

  // Send notification
  await supabase
    .from('notifications')
    .insert({
      user_id: application.user_id,
      type: 'seller_approved',
      title: 'Seller Application Approved!',
      message: `Your shop "${application.shop_name}" has been approved! You can now start adding products.`,
      data: { shop_id: shop.id, shop_slug: shopSlug }
    });
};

// Reject seller application
export const rejectSellerApplication = async (
  applicationId: string,
  reviewNotes: string
): Promise<void> => {
  const { data: application } = await supabase
    .from('seller_applications')
    .select('user_id, shop_name')
    .eq('id', applicationId)
    .single();

  if (!application) throw new Error('Application not found');

  const { data: { user } } = await supabase.auth.getUser();
  
  await supabase
    .from('seller_applications')
    .update({
      status: 'rejected',
      review_notes: reviewNotes,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', applicationId);

  // Send notification
  await supabase
    .from('notifications')
    .insert({
      user_id: application.user_id,
      type: 'seller_rejected',
      title: 'Seller Application Not Approved',
      message: `Unfortunately, your application for "${application.shop_name}" was not approved. ${reviewNotes}`,
      data: { application_id: applicationId }
    });
};

// Cancel seller application (user can cancel their own pending application)
export const cancelSellerApplication = async (applicationId: string): Promise<void> => {
  const { error } = await supabase
    .from('seller_applications')
    .delete()
    .eq('id', applicationId)
    .eq('status', 'pending'); // Only allow canceling pending applications

  if (error) throw error;
};

// Delete seller shop (user can delete their own shop)
export const deleteSellerShop = async (shopId: string): Promise<void> => {
  // First get the shop details to find business_id
  const { data: shop, error: shopError } = await supabase
    .from('seller_shops')
    .select('business_id, user_id')
    .eq('id', shopId)
    .single();

  if (shopError) throw shopError;
  if (!shop) throw new Error('Shop not found');

  // Delete shop products first
  if (shop.business_id) {
    await supabase
      .from('business_products')
      .delete()
      .eq('business_id', shop.business_id);
  }

  // Delete the shop
  const { error: deleteShopError } = await supabase
    .from('seller_shops')
    .delete()
    .eq('id', shopId);

  if (deleteShopError) throw deleteShopError;

  // Delete the associated business
  if (shop.business_id) {
    await supabase
      .from('businesses')
      .delete()
      .eq('id', shop.business_id);
  }

  // Remove business_owner role if user has no other shops
  const { data: otherShops } = await supabase
    .from('seller_shops')
    .select('id')
    .eq('user_id', shop.user_id);

  if (!otherShops || otherShops.length === 0) {
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', shop.user_id)
      .eq('role', 'business_owner');
  }
};

// Fetch seller shop by user
export const fetchSellerShopByUser = async (userId: string): Promise<SellerShop | null> => {
  const { data, error } = await supabase
    .from('seller_shops')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as SellerShop | null;
};

// Fetch seller shop by slug
export const fetchSellerShopBySlug = async (slug: string): Promise<SellerShop | null> => {
  const { data, error } = await supabase
    .from('seller_shops')
    .select('*')
    .eq('shop_slug', slug)
    .eq('is_active', true)
    .eq('is_approved', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as SellerShop | null;
};

// Update seller shop
export const updateSellerShop = async (
  shopId: string,
  updates: Partial<SellerShop>
): Promise<void> => {
  const { error } = await supabase
    .from('seller_shops')
    .update(updates)
    .eq('id', shopId);

  if (error) throw error;
};

/**
 * Fetch seller application by user ID
 */
export const fetchSellerApplicationByUser = async (
  userId: string
): Promise<SellerApplication | null> => {
  const { data, error } = await supabase
    .from('seller_applications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as SellerApplication | null;
};
