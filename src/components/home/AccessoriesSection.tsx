
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Truck } from 'lucide-react';
import { accessories } from '@/components/accessories/AccessoriesData';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';

const AccessoriesSection: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleOrder = (accessory: any) => {
    addToCart({
      type: 'accessory',
      name: accessory.name,
      quantity: 1,
      price: accessory.price,
      description: accessory.description,
      accessoryId: accessory.id,
      image: accessory.image_url
    });
    
    toast({
      title: "Added to Cart!",
      description: `${accessory.name} has been added to your cart.`,
    });
  };

  const handleViewAll = () => {
    navigate('/accessories');
  };

  // Show only first 6 accessories
  const displayedAccessories = accessories.slice(0, 6);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Gas Accessories</h2>
          <p className="text-gray-600 mt-2">Essential gas accessories for your kitchen</p>
        </div>
        <Button variant="ghost" onClick={handleViewAll} className="text-accent flex items-center gap-1">
          <span>View All</span>
          <ArrowRight size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayedAccessories.map((accessory, index) => (
          <motion.div
            key={accessory.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="h-full"
          >
            <Card className="bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col group hover:-translate-y-1">
              <CardHeader className="p-2">
                <div className="relative w-full pb-[75%] mb-2 rounded-lg overflow-hidden bg-white">
                  <img
                    src={accessory.image_url || '/images/accessory-fallback.jpg'}
                    alt={accessory.name}
                    loading="lazy"
                    width="200"
                    height="150"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/accessory-fallback.jpg';
                    }}
                    className="absolute inset-0 w-full h-full group-hover:scale-110 transition-transform duration-500 object-contain p-1"
                  />
                </div>
                <CardTitle className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem] px-2 leading-tight">
                  {accessory.name}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-3 pt-0 flex-grow">
                <p className="text-xs text-gray-600 mb-2 line-clamp-2 min-h-[2rem] leading-tight">
                  {accessory.description}
                </p>
                <p className="text-accent font-bold text-base mb-2">
                  UGX {accessory.price.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Truck className="w-3 h-3" />
                  <span>Free delivery</span>
                </div>
              </CardContent>
              
              <CardFooter className="p-3 pt-0">
                <Button
                  onClick={() => handleOrder(accessory)}
                  className="w-full bg-accent hover:bg-accent/90 text-white text-xs py-2 h-8 font-semibold transition-all duration-300 group-hover:shadow-lg"
                >
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default AccessoriesSection;
