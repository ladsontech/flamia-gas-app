import { Button } from "@/components/ui/button";

interface AdminNavProps {
  activeSection: 'orders' | 'hotdeals' | 'brands' | 'accessories';
  onSectionChange: (section: 'orders' | 'hotdeals' | 'brands' | 'accessories') => void;
}

export const AdminNav = ({ activeSection, onSectionChange }: AdminNavProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <Button
        variant={activeSection === 'orders' ? 'default' : 'outline'}
        onClick={() => onSectionChange('orders')}
      >
        Manage Orders
      </Button>
      <Button
        variant={activeSection === 'hotdeals' ? 'default' : 'outline'}
        onClick={() => onSectionChange('hotdeals')}
      >
        Manage Hot Deals
      </Button>
      <Button
        variant={activeSection === 'brands' ? 'default' : 'outline'}
        onClick={() => onSectionChange('brands')}
      >
        Manage Brands
      </Button>
      <Button
        variant={activeSection === 'accessories' ? 'default' : 'outline'}
        onClick={() => onSectionChange('accessories')}
      >
        Manage Accessories
      </Button>
    </div>
  );
};