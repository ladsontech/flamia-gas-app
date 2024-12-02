import { Button } from "@/components/ui/button";

interface AdminNavProps {
  activeSection: 'orders' | 'hotdeals';
  onSectionChange: (section: 'orders' | 'hotdeals') => void;
}

export const AdminNav = ({ activeSection, onSectionChange }: AdminNavProps) => {
  return (
    <div className="flex gap-4 mb-8">
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
    </div>
  );
};