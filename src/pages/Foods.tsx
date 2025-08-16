import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, MapPin, Phone, Star, RefreshCw, AlertCircle, ArrowLeft, Share2, Clock } from 'lucide-react';
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
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied",
          description: "Business link copied to clipboard!",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Final fallback - try to copy to clipboard
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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (selectedBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Compact Fixed Header */}
        <div className="bg-white shadow-sm sticky top-16 z-20 border-b">
          <div className="container mx-auto px-3 py-2">
            {/* Compact top row */}
            <div className="flex items-center justify-between mb-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {setSelectedBusiness(null); setProducts([]);}}
                className="flex items-center gap-1 p-1 hover:bg-gray-100 h-8"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </Button>
              
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => loadProducts(selectedBusiness.id)}
                  disabled={loading}
                  className="hidden sm:flex h-8 px-2"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  <span className="text-xs">Refresh</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleShareBusiness(selectedBusiness)}
                  className="flex items-center gap-1 h-8 px-2"
                >
                  <Share2 className="w-3 h-3" />
                  <span className="text-xs">Share</span>
                </Button>
              </div>
            </div>
            
            {/* Compact business info */}
            <div className="mb-3">
              <div className="flex items-start gap-2 mb-2">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage 
                    src={selectedBusiness.image_url} 
                    alt={selectedBusiness.name}
                  />
                  <AvatarFallback className="text-xs">
                    {selectedBusiness.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1 flex-wrap">
                    <h1 className="text-base font-bold text-gray-900 break-words">
                      {selectedBusiness.name}
                    </h1>
                    {selectedBusiness.is_featured && (
                      <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-1">
                    <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="text-xs break-words">{selectedBusiness.location}</span>
                  </div>
                  
                  {selectedBusiness.description && (
                    <p className="text-gray-600 text-xs leading-relaxed break-words line-clamp-1">
                      {selectedBusiness.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Compact search bar */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Content with compact cards */}
        <div className="flex-1 overflow-y-auto pt-2">
          <div className="container mx-auto px-3 py-2">
            {loading && (
              <div className="text-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500 text-sm">Loading products...</p>
              </div>
            )}

            {!loading && filteredProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
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
                          <div className="absolute top-1 left-1">
                            <span className="bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded text-[10px]">
                              Featured
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <CardContent className="p-3">
                      <h3 className="font-semibold mb-1 text-sm break-words line-clamp-1">{product.name}</h3>
                      
                      {product.description && (
                        <p className="text-gray-600 text-xs mb-1 line-clamp-2 break-words">
                          {product.description}
                        </p>
                      )}
                      
                      {product.category && (
                        <p className="text-gray-500 text-xs mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {product.category}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-bold text-green-600 block">
                            UGX {product.price.toLocaleString()}
                          </span>
                          {product.original_price && product.original_price > product.price && (
                            <span className="text-xs text-gray-500 line-through">
                              UGX {product.original_price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        
                        <Button 
                          size="sm"
                          onClick={() => handleOrderProduct(product, selectedBusiness)}
                          className="bg-green-600 hover:bg-green-700 flex-shrink-0 h-7 px-2"
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          <span className="text-xs">Order</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 mb-2 text-sm">No products found</p>
                {searchTerm && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSearchTerm('')}
                    className="h-8 px-3 text-xs"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-20">
      <div className="bg-white shadow-sm sticky top-16 z-10">
        <div className="container mx-auto px-3 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl sm:text-2xl font-bold">Food Businesses</h1>
            <Button 
              variant="outline" 
              size="sm"
              onClick={loadBusinesses}
              disabled={loading}
              className="h-8 px-3"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-xs">Refresh</span>
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
            <Input
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 py-3">
        {loading && (
          <div className="text-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500 text-sm">Loading businesses...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-600 mb-2 text-sm">{error}</p>
            <Button 
              variant="outline" 
              onClick={loadBusinesses}
              size="sm"
              className="h-8 px-3 text-xs"
            >
              Try again
            </Button>
          </div>
        )}

        {!loading && !error && filteredBusinesses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredBusinesses.map((business) => (
              <Card 
                key={business.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleBusinessSelect(business)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3 mb-2">
                    <Avatar className="w-10 h-10">
                      <AvatarImage 
                        src={business.image_url} 
                        alt={business.name}
                        onError={(e) => {
                          console.log("Business image failed to load:", business.image_url);
                        }}
                      />
                      <AvatarFallback className="text-xs">
                        {business.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1 mb-1">
                        <h3 className="font-semibold truncate text-sm">{business.name}</h3>
                        {business.is_featured && (
                          <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center text-gray-600 mb-1">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="text-xs truncate">{business.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  {business.description && (
                    <p className="text-gray-600 text-xs mb-2 line-clamp-2">{business.description}</p>
                  )}
                  
                  <Button className="w-full h-7 text-xs" size="sm">
                    View Menu
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && businesses.length === 0 && (
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 mb-2 text-sm">No businesses found</p>
            <Button 
              variant="outline" 
              onClick={loadBusinesses}
              size="sm"
              className="h-8 px-3 text-xs"
            >
              Try again
            </Button>
          </div>
        )}

        {!loading && !error && filteredBusinesses.length === 0 && businesses.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2 text-sm">No businesses match your search</p>
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm('')}
              size="sm"
              className="h-8 px-3 text-xs"
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
