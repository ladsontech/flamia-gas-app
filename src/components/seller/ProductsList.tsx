import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { BusinessProduct } from '@/types/business';
import { Edit, Trash2, Eye } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProductsListProps {
  businessId: string;
  onEdit: (product: BusinessProduct) => void;
  refresh: number;
}

export const ProductsList = ({ businessId, onEdit, refresh }: ProductsListProps) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<BusinessProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [businessId, refresh]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('business_products')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts((data as BusinessProduct[]) || []);
    } catch (error: any) {
      console.error('Error loading products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('business_products')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({
        title: 'Product deleted',
        description: 'Product has been removed successfully',
      });
      
      setProducts(products.filter(p => p.id !== deleteId));
      setDeleteId(null);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading products...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No products yet</p>
        <p className="text-sm text-muted-foreground">Add your first product to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-square relative bg-muted">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                {product.is_featured && (
                  <Badge variant="default" className="text-xs">Featured</Badge>
                )}
                {!product.is_available && (
                  <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                )}
              </div>
            </div>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold line-clamp-1">{product.name}</h3>
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              )}
              <div className="flex justify-end items-baseline gap-2">
                <span className="text-lg font-bold text-right">
                  UGX {product.price?.toLocaleString()}
                </span>
                {product.original_price && (
                  <span className="text-sm text-muted-foreground line-through text-right">
                    UGX {product.original_price?.toLocaleString()}
                  </span>
                )}
              </div>
              {product.affiliate_enabled && (
                <div className="text-xs text-muted-foreground">
                  Commission: {product.commission_type === 'percentage' 
                    ? `${product.commission_rate}%` 
                    : `${product.fixed_commission?.toLocaleString()} UGX`}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onEdit(product)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteId(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
