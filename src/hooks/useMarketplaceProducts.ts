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
      const flamiaProducts: MarketplaceProduct[] = (gadgets || []).map((gadget: any) => {
        let categoryName = gadget.category;
        // Map gadget categories to proper categories
        if (gadget.category.toLowerCase().includes('phone')) {
          categoryName = 'Phones & Tablets';
        } else if (gadget.category.toLowerCase().includes('laptop') || gadget.category.toLowerCase().includes('computer')) {
          categoryName = 'Laptops & Computers';
        } else if (gadget.category.toLowerCase().includes('accessory') || gadget.category.toLowerCase().includes('cable') || gadget.category.toLowerCase().includes('charger')) {
          categoryName = 'Electronics Accessories';
        }

        return {
          id: gadget.id,
          name: gadget.name,
          description: gadget.description,
          price: gadget.price,
          original_price: gadget.original_price,
          image_url: gadget.image_url,
          category: categoryName,
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

      // Combine all products
      const allProducts = [...flamiaProducts, ...mappedSellerProducts];

      // Group products by category
      const categoryMap = new Map<string, CategoryGroup>();

      allProducts.forEach(product => {
        const categoryKey = product.category;
        if (!categoryMap.has(categoryKey)) {
          categoryMap.set(categoryKey, {
            id: product.category_id || categoryKey,
            name: categoryKey,
            slug: categoryKey.toLowerCase().replace(/\s+/g, '-'),
            products: [],
          });
        }
        categoryMap.get(categoryKey)!.products.push(product);
      });

      // Convert to array and sort by product count
      const categorizedProducts = Array.from(categoryMap.values()).sort((a, b) => 
        b.products.length - a.products.length
      );

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
