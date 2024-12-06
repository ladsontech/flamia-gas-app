import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Brand {
  name: string;
  image: string;
  prices: {
    '6kg': string;
    '12kg': string;
  };
}

const defaultBrands: Brand[] = [
  {
    name: "Stabex Gas",
    image: "/lovable-uploads/e9f58b5e-1991-4b14-b472-186d3ae2104c.png",
    prices: {
      '6kg': "UGX 140,000",
      '12kg': "UGX 350,000"
    }
  },
  {
    name: "Total Gas",
    image: "/lovable-uploads/de1ceb4f-f2dc-48e0-840d-abc0c4c37e53.png",
    prices: {
      '6kg': "UGX 180,000",
      '12kg': "UGX 400,000"
    }
  },
  {
    name: "Shell Gas",
    image: "/lovable-uploads/6d78b534-027a-4754-8770-24f2c82b4b71.png",
    prices: {
      '6kg': "UGX 160,000",
      '12kg': "UGX 380,000"
    }
  }
];

export const BrandsManager = () => {
  const { toast } = useToast();
  const [brands, setBrands] = useState<Brand[]>(defaultBrands);
  const [selectedBrandIndex, setSelectedBrandIndex] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleBrandUpdate = async (index: number) => {
    try {
      let imageUrl = brands[index].image;
      
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
        ...updatedBrands[index],
        image: imageUrl,
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
                <Label htmlFor={`price6kg-${index}`}>6KG Price</Label>
                <Input
                  id={`price6kg-${index}`}
                  value={brand.prices['6kg']}
                  onChange={(e) => {
                    const updatedBrands = [...brands];
                    updatedBrands[index] = {
                      ...brand,
                      prices: { ...brand.prices, '6kg': e.target.value }
                    };
                    setBrands(updatedBrands);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`price12kg-${index}`}>12KG Price</Label>
                <Input
                  id={`price12kg-${index}`}
                  value={brand.prices['12kg']}
                  onChange={(e) => {
                    const updatedBrands = [...brands];
                    updatedBrands[index] = {
                      ...brand,
                      prices: { ...brand.prices, '12kg': e.target.value }
                    };
                    setBrands(updatedBrands);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`image-${index}`}>Brand Image</Label>
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