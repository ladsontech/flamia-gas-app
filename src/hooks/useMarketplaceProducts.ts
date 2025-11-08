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
  // Fetch all data in parallel for better performance
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
        businesses!inner(
          id,
          name
        )
      `)
      .eq('is_available', true)
      .limit(500) // Limit to prevent loading too many products at once
  ]);

  if (categoriesResult.error) throw categoriesResult.error;
  if (productsResult.error) throw productsResult.error;

  const productCategories = categoriesResult.data || [];
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

  // Create category map for quick lookup
  const categoryLookup = new Map(
    productCategories.map(cat => [cat.id, cat])
  );

  // Map products to marketplace format
  const mappedProducts: MarketplaceProduct[] = allProducts.map((product: any) => {
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
      viewCount: 0 // Will be loaded lazily if needed
        };
      });

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

  // Add products to their categories
  mappedProducts.forEach(product => {
    if (product.category_id && categoryMap.has(product.category_id)) {
      categoryMap.get(product.category_id)!.products.push(product);
        } else {
      // Fallback: try to find category by name
      const matchedCategory = Array.from(categoryMap.values()).find(
        cat => cat.name.toLowerCase() === product.category.toLowerCase()
      );
          if (matchedCategory) {
        matchedCategory.products.push(product);
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
