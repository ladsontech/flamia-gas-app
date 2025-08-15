
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, MapPin, Phone, Star, RefreshCw, AlertCircle } from 'lucide-react';
import { Business, BusinessProduct } from '@/types/business';
import { fetchBusinesses, fetchBusinessProducts } from '@/services/businessService';
import { useToast } from '@/hooks/use-toast';

const Foods: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<BusinessProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
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
    setProducts([]); // Clear products first
    loadProducts(business.id);
  };

  const handleOrderProduct = (product: BusinessProduct, business: Business) => {
    const message = `Hello! I'd like to order ${product.name} - UGX ${product.price.toLocaleString()} from ${business.name}`;
    const whatsappUrl = `https://wa.me/${business.contact.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredBusinesses = businesses.filter(business =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (selectedBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 pt-20">
        <div className="bg-white shadow-sm sticky top-16 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="outline" 
                onClick={() => {setSelectedBusiness(null); setProducts([]);}}
              >
                ← Back to Businesses
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => loadProducts(selectedBusiness.id)}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-2">
                {selectedBusiness.is_featured && (
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                )}
                <h1 className="text-2xl font-bold">{selectedBusiness.name}</h1>
              </div>
              <div className="flex items-center text-gray-600 mb-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{selectedBusiness.location}</span>
              </div>
              {selectedBusiness.description && (
                <p className="text-gray-600 text-sm">{selectedBusiness.description}</p>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-4">
          {loading && (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Loading products...</p>
            </div>
          )}

          {!loading && filteredProducts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  {product.image_url && (
                    <div className="aspect-square relative">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log("Image failed to load:", product.image_url);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      {product.is_featured && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{product.name}</h3>
                    
                    {product.description && (
                      <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                    )}
                    
                    {product.category && (
                      <p className="text-gray-500 text-xs mb-2">{product.category}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-green-600">
                          UGX {product.price.toLocaleString()}
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            UGX {product.original_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      <Button 
                        size="sm"
                        onClick={() => handleOrderProduct(product, selectedBusiness)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Order
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No products found</p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  className="mt-4"
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-20">
      <div className="bg-white shadow-sm sticky top-16 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Food Businesses</h1>
            <Button 
              variant="outline" 
              size="sm"
              onClick={loadBusinesses}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Loading businesses...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={loadBusinesses}
            >
              Try again
            </Button>
          </div>
        )}

        {!loading && !error && filteredBusinesses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBusinesses.map((business) => (
              <Card 
                key={business.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleBusinessSelect(business)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4 mb-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage 
                        src={business.image_url} 
                        alt={business.name}
                        onError={(e) => {
                          console.log("Business image failed to load:", business.image_url);
                        }}
                      />
                      <AvatarFallback>
                        {business.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold truncate">{business.name}</h3>
                        {business.is_featured && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="text-sm truncate">{business.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  {business.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{business.description}</p>
                  )}
                  
                  <Button className="w-full" size="sm">
                    View Menu
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && businesses.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No businesses found</p>
            <Button 
              variant="outline" 
              onClick={loadBusinesses}
            >
              Try again
            </Button>
          </div>
        )}

        {!loading && !error && filteredBusinesses.length === 0 && businesses.length > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No businesses match your search</p>
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
