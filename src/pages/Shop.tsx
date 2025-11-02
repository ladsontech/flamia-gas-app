import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, RefreshCw, AlertCircle, Store, Package, ShoppingBag } from 'lucide-react';
import { useMarketplaceProducts, MarketplaceProduct } from '@/hooks/useMarketplaceProducts';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const Shop: React.FC = () => {
  const { categories, loading, error, refetch } = useMarketplaceProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAddToCart = (product: MarketplaceProduct) => {
    addToCart({
      type: 'shop',
      name: product.name,
      quantity: 1,
      price: product.price,
      description: product.description,
      businessName: product.source === 'flamia' ? 'Flamia' : product.shop_name,
      productId: product.id,
      image: product.image_url,
    });

    toast({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart.`,
    });

    navigate('/order');
  };

  // Filter products based on search and category
  const filteredCategories = categories
    .map(category => ({
      ...category,
      products: category.products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || category.slug === selectedCategory;
        return matchesSearch && matchesCategory;
      }),
    }))
    .filter(category => category.products.length > 0);

  const totalProducts = categories.reduce((sum, cat) => sum + cat.products.length, 0);
  const uniqueCategories = categories.length;

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Shop - Flamia Marketplace Uganda</title>
          <meta name="description" content="Shop household materials, electronics, phones, laptops and more at Flamia marketplace Uganda" />
        </Helmet>
        <div className="min-h-screen bg-gray-50 pt-20 pb-20">
          <div className="px-3 sm:px-4 lg:px-32 xl:px-48 2xl:px-64 py-6 space-y-6">
            <Skeleton className="h-12 w-full max-w-md" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Shop - Flamia Marketplace Uganda</title>
        </Helmet>
        <div className="min-h-screen bg-gray-50 pt-20 pb-20 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mb-3 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Products</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Shop - Flamia Marketplace | Household Materials, Electronics & More Uganda</title>
        <meta name="description" content="Shop the largest marketplace for household materials in Uganda. Phones, laptops, electronics, appliances and products from verified sellers. Fast delivery in Kampala." />
        <meta name="keywords" content="marketplace Uganda, household materials, electronics Uganda, phones Kampala, laptops Uganda, shop online Uganda" />
        <link rel="canonical" href="https://flamia.store/shop" />
        <meta property="og:title" content="Flamia Marketplace - Household Materials Uganda" />
        <meta property="og:description" content="Uganda's largest marketplace for household materials and electronics" />
        <meta property="og:url" content="https://flamia.store/shop" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 pt-20 pb-20">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-16 z-10 border-b">
          <div className="px-3 sm:px-4 lg:px-32 xl:px-48 2xl:px-64 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <Store className="w-8 h-8 text-primary" />
                  Flamia Marketplace
                </h1>
                <p className="text-gray-600 mt-1">Your one-stop shop for household materials</p>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  <span><strong>{totalProducts}</strong> Products</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <span><strong>{uniqueCategories}</strong> Categories</span>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  All Categories
                </Button>
                {categories.map(category => (
                  <Button
                    key={category.slug}
                    variant={selectedCategory === category.slug ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.slug)}
                  >
                    {category.name} ({category.products.length})
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Products by Category */}
        <div className="px-3 sm:px-4 lg:px-32 xl:px-48 2xl:px-64 py-6 space-y-12">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mb-3 mx-auto" />
              <p className="text-gray-500">No products found matching your search.</p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                  className="mt-4"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            filteredCategories.map(category => (
              <section key={category.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                  <Badge variant="secondary">{category.products.length} items</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {category.products.map(product => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square relative bg-gray-100">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        {product.featured && (
                          <Badge className="absolute top-2 left-2">Featured</Badge>
                        )}
                        {product.source === 'seller' && product.shop_name && (
                          <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                            {product.shop_name}
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg font-bold text-primary">
                            UGX {product.price.toLocaleString()}
                          </span>
                          {product.original_price && product.original_price > product.price && (
                            <span className="text-xs text-gray-500 line-through">
                              UGX {product.original_price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <Button 
                          className="w-full" 
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                        >
                          Add to Cart
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Shop;
