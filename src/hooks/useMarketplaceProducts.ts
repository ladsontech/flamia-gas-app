import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Gadget } from '@/types/gadget';
import { BusinessProduct } from '@/types/business';

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
  in_stock?: boolean;
  is_available?: boolean;
  featured?: boolean;
}

export interface CategoryGroup {
  id: string;
  name: string;
  slug: string;
  products: MarketplaceProduct[];
}

export const useMarketplaceProducts = () => {
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Flamia gadgets
      const { data: gadgets, error: gadgetsError } = await supabase
        .from('gadgets')
        .select('*')
        .eq('in_stock', true);

      if (gadgetsError) throw gadgetsError;

      // Fetch approved seller shops and their products
      const { data: sellerShops, error: shopsError } = await supabase
        .from('seller_shops')
        .select(`
          id,
          shop_name,
          shop_slug,
          category_id,
          business_id
        `)
        .eq('is_active', true)
        .eq('is_approved', true);

      if (shopsError) throw shopsError;

      // Fetch products from seller shops' businesses
      const businessIds = sellerShops
        ?.filter(shop => shop.business_id)
        .map(shop => shop.business_id);

      let sellerProducts: any[] = [];
      if (businessIds && businessIds.length > 0) {
        const { data: products, error: productsError } = await supabase
          .from('business_products')
          .select('*')
          .in('business_id', businessIds)
          .eq('is_available', true);

        if (productsError) throw productsError;
        sellerProducts = products || [];
      }

      // Fetch product categories
      const { data: productCategories, error: categoriesError } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (categoriesError) throw categoriesError;

      // Map gadgets to marketplace products with proper categories
      // Match gadget categories to product_categories
      const flamiaProducts: MarketplaceProduct[] = (gadgets || []).map((gadget: any) => {
        let categoryName = gadget.category;
        let categoryId: string | undefined;
        
        // Try to find matching category in product_categories
        const gadgetCategoryLower = gadget.category.toLowerCase();
        
        // Map gadget categories to product categories
        const categoryMapping: { [key: string]: string } = {
          'phone': 'Phones',
          'phones': 'Phones',
          'smartphone': 'Phones',
          'tablet': 'Phones',
          'laptop': 'Laptops & PCs',
          'laptops': 'Laptops & PCs',
          'computer': 'Laptops & PCs',
          'pc': 'Laptops & PCs',
          'tv': 'TVs',
          'television': 'TVs',
          'speaker': 'Audio & Speakers',
          'audio': 'Audio & Speakers',
          'headphone': 'Audio & Speakers',
          'earphone': 'Audio & Speakers',
          'accessory': 'Electronics',
          'accessories': 'Electronics',
          'cable': 'Electronics',
          'charger': 'Electronics',
        };

        // Find matching category
        for (const [key, mappedCategory] of Object.entries(categoryMapping)) {
          if (gadgetCategoryLower.includes(key)) {
            categoryName = mappedCategory;
            // Find the category ID from product_categories
            const matchedCategory = productCategories?.find(c => 
              c.name.toLowerCase() === mappedCategory.toLowerCase() ||
              c.slug.toLowerCase() === mappedCategory.toLowerCase().replace(/\s+/g, '-')
            );
            if (matchedCategory) {
              categoryId = matchedCategory.id;
              categoryName = matchedCategory.name; // Use the exact name from database
            }
            break;
          }
        }

        // If no match found, try to find by slug or use 'Electronics' as default
        if (!categoryId) {
          const defaultCategory = productCategories?.find(c => 
            c.slug === 'electronics' || c.name.toLowerCase() === 'electronics'
          );
          if (defaultCategory) {
            categoryName = defaultCategory.name;
            categoryId = defaultCategory.id;
          } else {
            // Fallback to original category name
            categoryName = gadget.category;
          }
        }

        return {
          id: gadget.id,
          name: gadget.name,
          description: gadget.description,
          price: gadget.price,
          original_price: gadget.original_price,
          image_url: gadget.image_url,
          category: categoryName,
          category_id: categoryId,
          source: 'flamia',
          in_stock: gadget.in_stock,
          featured: gadget.featured,
        };
      });

      // Map seller products to marketplace products
      const mappedSellerProducts: MarketplaceProduct[] = sellerProducts.map((product: BusinessProduct) => {
        const shop = sellerShops?.find(s => s.business_id === product.business_id);
        const category = productCategories?.find(c => c.id === product.category_id);
        
        return {
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: product.price,
          original_price: product.original_price,
          image_url: product.image_url,
          category: category?.name || product.category || 'Other',
          category_id: product.category_id,
          source: 'seller',
          shop_name: shop?.shop_name,
          shop_slug: shop?.shop_slug,
          is_available: product.is_available,
          featured: product.is_featured,
        };
      });

      // Combine all products (gadgets + seller products)
      const allProducts = [...flamiaProducts, ...mappedSellerProducts];

      // Group products by category - use both parent and subcategories
      const categoryMap = new Map<string, CategoryGroup>();

      // Create category groups from all product_categories (parent and subcategories)
      productCategories?.forEach(cat => {
        categoryMap.set(cat.name, {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          products: [],
        });
      });

      // Now add products to their categories
      allProducts.forEach(product => {
        const categoryKey = product.category;
        
        // Try to find exact match first
        if (categoryMap.has(categoryKey)) {
          categoryMap.get(categoryKey)!.products.push(product);
        } else {
          // Try to find by slug or name match
          const matchedCategory = productCategories?.find(c => 
            c.name.toLowerCase() === categoryKey.toLowerCase() ||
            c.slug.toLowerCase() === categoryKey.toLowerCase().replace(/\s+/g, '-')
          );
          
          if (matchedCategory) {
            const matchedKey = matchedCategory.name;
            if (!categoryMap.has(matchedKey)) {
              categoryMap.set(matchedKey, {
                id: matchedCategory.id,
                name: matchedCategory.name,
                slug: matchedCategory.slug,
                products: [],
              });
            }
            categoryMap.get(matchedKey)!.products.push(product);
          } else {
            // Create category group for unmatched categories (fallback)
            if (!categoryMap.has(categoryKey)) {
              categoryMap.set(categoryKey, {
                id: product.category_id || categoryKey,
                name: categoryKey,
                slug: categoryKey.toLowerCase().replace(/\s+/g, '-'),
                products: [],
              });
            }
            categoryMap.get(categoryKey)!.products.push(product);
          }
        }
      });

      // Convert to array - show all categories from product_categories, sorted by display_order
      const categorizedProducts = Array.from(categoryMap.values())
        .sort((a, b) => {
          // Get display_order from product_categories
          const aOrder = productCategories?.find(pc => pc.name === a.name || pc.slug === a.slug)?.display_order || 999;
          const bOrder = productCategories?.find(pc => pc.name === b.name || pc.slug === b.slug)?.display_order || 999;
          
          // Categories with products first, then by display_order
          if (a.products.length > 0 && b.products.length === 0) return -1;
          if (a.products.length === 0 && b.products.length > 0) return 1;
          if (aOrder !== bOrder) return aOrder - bOrder;
          return b.products.length - a.products.length;
        });

      setCategories(categorizedProducts);
    } catch (err) {
      console.error('Error fetching marketplace products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading, error, refetch: fetchAllProducts };
};
