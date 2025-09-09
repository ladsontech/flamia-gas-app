import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getMarketplaceSettings, updateMarketplaceSettings } from '@/services/adminService';

const MarketplaceSettings = () => {
  const { toast } = useToast();
  const [imagesPerProduct, setImagesPerProduct] = useState<number>(4);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const s = await getMarketplaceSettings();
      setImagesPerProduct(s.images_per_product ?? 4);
    } catch (e: any) {
      toast({ title: 'Failed to load settings', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setLoading(true);
    try {
      await updateMarketplaceSettings({ images_per_product: Math.max(1, Math.min(8, imagesPerProduct)) });
      toast({ title: 'Settings updated' });
    } catch (e: any) {
      toast({ title: 'Update failed', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marketplace Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Images per product (1-8)</Label>
          <Input
            type="number"
            value={imagesPerProduct}
            min={1}
            max={8}
            onChange={(e) => setImagesPerProduct(Number(e.target.value))}
            className="max-w-xs"
          />
        </div>
        <div>
          <Button onClick={save} disabled={loading}>{loading ? 'Saving...' : 'Save Settings'}</Button>
          <Button variant="outline" className="ml-2" onClick={load} disabled={loading}>Reload</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketplaceSettings;

