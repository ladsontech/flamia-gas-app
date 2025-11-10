import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MarketplaceProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url?: string;
  category: string;
  category_id?: string;
  source: 'flamia' | 'seller';
  shop_name?: string;
  shop_slug?: string;
  is_available?: boolean;
  featured?: boolean;
  viewCount?: number;
}

export interface CategoryGroup {
  id: string;
  name: string;
  slug: string;
  products: MarketplaceProduct[];
}

const FLAMIA_BUSINESS_ID = '00000000-0000-0000-0000-000000000001';

export const useMarketplaceProducts = () => {
  const { data, isLoading, error: queryError, refetch } = useQuery({
    queryKey: ['marketplace-categories'],
    queryFn: fetchAllProducts,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return {
    categories: data || [],
    loading: isLoading,
    error: queryError ? (queryError as Error).message : null,
    refetch
  };
};

const fetchAllProducts = async (): Promise<CategoryGroup[]> => {
  // Fetch categories and business products in parallel for better performance
  const [categoriesResult, productsResult] = await Promise.all([
    // Fetch product categories
    supabase
      .from('product_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order'),

    // Fetch all business products (Flamia + Sellers) with shop info in one query
    supabase
      .from('business_products')
      .select(`
        *,
        businesses(
          id,
          name
        )
      `)
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .limit(500) // Limit to prevent loading too many products at once
  ]);

  if (categoriesResult.error) throw categoriesResult.error;
  if (productsResult.error) throw productsResult.error;
  // Fetch Flamia products
  const { data: flamiaProducts, error: flamiaError } = await supabase
    .from('flamia_products')
    .select('*')
    .eq('in_stock', true)
    .order('created_at', { ascending: false })
    .limit(500);

  const allGadgets = flamiaProducts || [];

  const productCategories = (categoriesResult.data || []) as any[];
  const allProducts = productsResult.data || [];

  // Fetch seller shops for mapping (only for non-Flamia products)
  const nonFlamiaProducts = allProducts.filter(p => p.business_id !== FLAMIA_BUSINESS_ID);
  const businessIds = [...new Set(nonFlamiaProducts.map(p => p.business_id))];
  
  let sellerShopsMap = new Map();
  if (businessIds.length > 0) {
    const { data: sellerShops } = await supabase
      .from('seller_shops')
      .select('business_id, shop_name, shop_slug')
      .in('business_id', businessIds)
      .eq('is_active', true)
      .eq('is_approved', true);

    if (sellerShops) {
      sellerShops.forEach(shop => {
        sellerShopsMap.set(shop.business_id, shop);
      });
    }
  }

  // Create category maps for quick lookup (by id and by name)
  const categoryLookup = new Map(
    productCategories.map(cat => [cat.id, cat])
  );
  const categoryNameLookup = new Map(
    productCategories.map(cat => [String(cat.name).toLowerCase(), cat])
  );

  // Category alias map to align Flamia categories with marketplace categories
  const normalizeName = (name?: string) => String(name || '').trim().toLowerCase();
  const categoryAlias = new Map<string, string>([
    ['smartphones', 'phones'],
    ['smartphone', 'phones'],
    ['phone', 'phones'],
    ['phones', 'phones'],
    ['mobiles', 'phones'],

    ['laptops', 'laptops & pcs'],
    ['laptop', 'laptops & pcs'],
    ['computers', 'laptops & pcs'],
    ['pcs', 'laptops & pcs'],

    ['wearables', 'electronics'],
    ['electronics', 'electronics'],
  ]);
  const defaultElectronicsCategory = categoryNameLookup.get('electronics');

  // Map business products to marketplace format
  const mappedBusinessProducts: MarketplaceProduct[] = allProducts.map((product: any) => {
    const category = categoryLookup.get(product.category_id);
    const isFlamiaProduct = product.business_id === FLAMIA_BUSINESS_ID;
    const shop = !isFlamiaProduct ? sellerShopsMap.get(product.business_id) : null;

    return {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      original_price: product.original_price,
      image_url: product.image_url,
      category: category?.name || 'Other',
      category_id: product.category_id,
      source: isFlamiaProduct ? 'flamia' : 'seller',
      shop_name: shop?.shop_name,
      shop_slug: shop?.shop_slug,
      is_available: product.is_available,
      featured: product.is_featured || false,
      viewCount: 0, // Will be loaded lazily if needed
    };
  });

  // Map Flamia products to marketplace format with category matching and aliases
  const mappedGadgets: MarketplaceProduct[] = allGadgets.map((gadget: any) => {
    const rawCat = String(gadget.category || '');
    const normalized = normalizeName(rawCat);
    const aliasedName = categoryAlias.get(normalized) || rawCat;
    const matchedCategory = categoryNameLookup.get(normalizeName(aliasedName));

    const resolvedCategoryId = matchedCategory?.id || defaultElectronicsCategory?.id;
    const resolvedCategoryName = matchedCategory?.name || aliasedName || defaultElectronicsCategory?.name || 'Other';

    return {
      id: gadget.id,
      name: gadget.name,
      description: gadget.description || '',
      price: gadget.price,
      original_price: gadget.original_price,
      image_url: gadget.image_url,
      category: resolvedCategoryName,
      category_id: resolvedCategoryId,
      source: 'flamia',
      shop_name: 'Flamia',
      shop_slug: 'flamia',
      is_available: gadget.in_stock,
      featured: gadget.featured || false,
      viewCount: 0,
    };
  });

  const mappedProducts: MarketplaceProduct[] = [
    ...mappedBusinessProducts,
    ...mappedGadgets,
  ];

  // Group products by category
      const categoryMap = new Map<string, CategoryGroup>();

  // Initialize all categories (even empty ones)
  productCategories.forEach((cat: any) => {
    categoryMap.set(cat.id, {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          products: [],
        });
      });

  // Add products to their categories (try both category_id and name matching)
  mappedProducts.forEach(product => {
    let added = false;
    
    // First try by category_id
    if (product.category_id && categoryMap.has(product.category_id)) {
      categoryMap.get(product.category_id)!.products.push(product);
      added = true;
    } 
    
    // Fallback: try to find category by name (case insensitive)
    if (!added && product.category) {
      const matchedCategory = Array.from(categoryMap.values()).find(
        cat => cat.name.toLowerCase() === String(product.category).toLowerCase()
      );
      if (matchedCategory) {
        matchedCategory.products.push(product);
        added = true;
      }
    }
  });

  // Convert to array and sort
      const categorizedProducts = Array.from(categoryMap.values())
    .filter(cat => cat.products.length > 0) // Only show categories with products
        .sort((a, b) => {
      const aCat = categoryLookup.get(a.id) as any;
      const bCat = categoryLookup.get(b.id) as any;
      const aOrder = aCat?.display_order || 999;
      const bOrder = bCat?.display_order || 999;
      return aOrder - bOrder;
    });

  return categorizedProducts;
};
