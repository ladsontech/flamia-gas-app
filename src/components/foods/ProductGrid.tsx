
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Clock, Tag } from 'lucide-react';
import { BusinessProduct, Business } from '@/types/business';

interface ProductGridProps {
  products: BusinessProduct[];
  business: Business;
  onOrderProduct: (product: BusinessProduct, business: Business) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, business, onOrderProduct }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <Card key={product.id} className="group bg-card shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
          {/* Square image container */}
          <div className="aspect-square relative bg-gradient-to-br from-muted to-muted/80 overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Tag className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {product.is_featured && (
                <Badge className="bg-accent text-accent-foreground text-xs px-2 py-1">
                  Featured
                </Badge>
              )}
              {!product.is_available && (
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  Unavailable
                </Badge>
              )}
            </div>
          </div>
          
          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg text-foreground line-clamp-2 mb-1">
                  {product.name}
                </h3>
                
                {product.description && (
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                    {product.description}
                  </p>
                )}
                
                {product.category && (
                  <div className="flex items-center text-muted-foreground text-xs mb-2">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{product.category}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-accent">
                    UGX {product.price.toLocaleString()}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      UGX {product.original_price.toLocaleString()}
                    </span>
                  )}
                </div>
                
                <Button 
                  onClick={() => onOrderProduct(product, business)}
                  disabled={!product.is_available}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {product.is_available ? 'Order Now' : 'Unavailable'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProductGrid;
