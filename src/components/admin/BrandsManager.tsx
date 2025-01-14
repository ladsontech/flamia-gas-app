import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Brand {
  id: string;
  name: string;
  brand: string;
  image_url_3kg: string | null;
  image_url_6kg: string | null;
  image_url_12kg: string | null;
  price_6kg: string | null;
  price_12kg: string | null;
  refill_price_3kg: string | null;
  refill_price_6kg: string | null;
  refill_price_12kg: string | null;
}

export const BrandsManager = () => {
  const { toast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandIndex, setSelectedBrandIndex] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [selectedSize, setSelectedSize] = useState<'3kg' | '6kg' | '12kg'>('6kg');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleBrandUpdate = async (index: number) => {
    try {
      let imageUrl = null;
      const brand = brands[index];
      
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('hot_deals')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('hot_deals')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrl;
      }

      const updatedBrands = [...brands];
      updatedBrands[index] = {
        ...brand,
        [`image_url_${selectedSize}`]: imageUrl || brand[`image_url_${selectedSize}`],
      };

      setBrands(updatedBrands);
      setSelectedBrandIndex(null);
      setFile(null);

      toast({
        title: "Success",
        description: "Brand updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update brand",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Manage Brands</h2>
      {brands.map((brand, index) => (
        <Card key={index} className="mb-4">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{brand.name}</span>
              <Button
                variant="outline"
                onClick={() => setSelectedBrandIndex(selectedBrandIndex === index ? null : index)}
              >
                {selectedBrandIndex === index ? 'Cancel' : 'Edit'}
              </Button>
            </CardTitle>
          </CardHeader>
          {selectedBrandIndex === index && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`name-${index}`}>Name</Label>
                <Input
                  id={`name-${index}`}
                  value={brand.name}
                  onChange={(e) => {
                    const updatedBrands = [...brands];
                    updatedBrands[index] = { ...brand, name: e.target.value };
                    setBrands(updatedBrands);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Select Size for Image Upload</Label>
                <div className="flex gap-2">
                  <Button
                    variant={selectedSize === '3kg' ? 'default' : 'outline'}
                    onClick={() => setSelectedSize('3kg')}
                  >
                    3KG
                  </Button>
                  <Button
                    variant={selectedSize === '6kg' ? 'default' : 'outline'}
                    onClick={() => setSelectedSize('6kg')}
                  >
                    6KG
                  </Button>
                  <Button
                    variant={selectedSize === '12kg' ? 'default' : 'outline'}
                    onClick={() => setSelectedSize('12kg')}
                  >
                    12KG
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`image-${index}`}>Brand Image ({selectedSize})</Label>
                <Input
                  id={`image-${index}`}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => handleBrandUpdate(index)}
                  className="w-full"
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};