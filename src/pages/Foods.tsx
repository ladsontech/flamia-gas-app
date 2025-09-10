import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';
import { Business, BusinessProduct } from '@/types/business';
import { fetchBusinesses, fetchBusinessProducts } from '@/services/businessService';
import { useToast } from '@/hooks/use-toast';
import BusinessHeader from '@/components/foods/BusinessHeader';
import ProductGrid from '@/components/foods/ProductGrid';
import BusinessList from '@/components/foods/BusinessList';

const Foods: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<BusinessProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Loading businesses...");
      const data = await fetchBusinesses();
      console.log("Businesses loaded:", data);
      setBusinesses(data);
      
      if (data.length === 0) {
        setError("No food businesses are available at the moment.");
        toast({
          title: "No businesses found",
          description: "No food businesses are available at the moment.",
        });
      }
    } catch (error) {
      console.error('Error loading businesses:', error);
      const errorMsg = "Failed to load businesses. Please try again.";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (businessId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Loading products for business:", businessId);
      const data = await fetchBusinessProducts(businessId);
      console.log("Products loaded:", data);
      setProducts(data);
      
      if (data.length === 0) {
        toast({
          title: "No products found",
          description: "This business doesn't have any products available at the moment.",
        });
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessSelect = (business: Business) => {
    console.log("Selecting business:", business);
    setSelectedBusiness(business);
    setProducts([]);
    setSearchTerm('');
    loadProducts(business.id);
  };

  const handleBackToBusiness = () => {
    setSelectedBusiness(null);
    setProducts([]);
    setSearchTerm('');
    setCategoryFilter('all');
  };

  const handleOrderProduct = (product: BusinessProduct, business: Business) => {
    const message = `Hello! I'd like to order ${product.name} - UGX ${product.price.toLocaleString()} from ${business.name}`;
    const whatsappUrl = `https://wa.me/${business.contact.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareBusiness = async (business: Business) => {
    const currentUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${currentUrl}?business=${business.id}`;
    const shareData = {
      title: `${business.name} - Food Menu`,
      text: `Check out ${business.name}'s delicious food menu! Located at ${business.location}`,
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully",
          description: "Business details shared!",
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied",
          description: "Business link copied to clipboard!",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied",
          description: "Business link copied to clipboard!",
        });
      } catch (clipboardError) {
        toast({
          title: "Share failed",
          description: "Unable to share or copy link",
          variant: "destructive",
        });
      }
    }
  };

  const filteredBusinesses = businesses.filter(business =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const availableCategories = ['all', ...new Set(products.filter(p => p.category).map(p => p.category!))];

  // Business detail view
  if (selectedBusiness) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BusinessHeader 
          business={selectedBusiness}
          onBack={handleBackToBusiness}
          onShare={handleShareBusiness}
        />

        {/* Products content */}
        <div className="px-3 sm:px-4 lg:px-32 xl:px-48 2xl:px-64 py-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mb-3" />
              <p className="text-gray-500">Loading products...</p>
            </div>
          )}

          {!loading && filteredProducts.length > 0 && (
            <>
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Products ({filteredProducts.length})
                </h2>
                
                {availableCategories.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {availableCategories.map(category => (
                      <Button
                        key={category}
                        variant={categoryFilter === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategoryFilter(category)}
                        className={`text-xs ${
                          categoryFilter === category 
                            ? 'bg-accent text-accent-foreground' 
                            : 'hover:bg-accent/10'
                        }`}
                      >
                        {category === 'all' ? 'All Categories' : category}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              
              <ProductGrid 
                products={filteredProducts}
                business={selectedBusiness}
                onOrderProduct={handleOrderProduct}
              />
            </>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-500 mb-3">No products found</p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Business list view
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-16 z-10 border-b border-gray-100">
        <div className="px-3 sm:px-4 lg:px-32 xl:px-48 2xl:px-64 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Food Businesses</h1>
            <Button 
              variant="outline" 
              onClick={loadBusinesses}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 sm:px-4 lg:px-32 xl:px-48 2xl:px-64 py-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mb-3" />
            <p className="text-gray-500">Loading businesses...</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
            <p className="text-red-600 mb-3">{error}</p>
            <Button 
              variant="outline" 
              onClick={loadBusinesses}
            >
              Try again
            </Button>
          </div>
        )}

        {!loading && !error && filteredBusinesses.length > 0 && (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Available Businesses ({filteredBusinesses.length})
              </h2>
            </div>
            <BusinessList 
              businesses={filteredBusinesses}
              onBusinessSelect={handleBusinessSelect}
            />
          </>
        )}

        {!loading && !error && businesses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-500 mb-3">No businesses found</p>
            <Button 
              variant="outline" 
              onClick={loadBusinesses}
            >
              Try again
            </Button>
          </div>
        )}

        {!loading && !error && filteredBusinesses.length === 0 && businesses.length > 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 mb-3">No businesses match your search</p>
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm('')}
            >
              Clear search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Foods;
