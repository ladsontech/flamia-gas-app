import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  ShoppingCart, 
  Package, 
  DollarSign, 
  Users, 
  Megaphone,
  Smartphone,
  Tag,
  Building2,
  ShoppingBag,
  UserCheck,
  Sparkles,
  Image
} from "lucide-react";
import type { AdminPermission, UserWithPermissions } from "@/services/permissionsService";
import { getAllUsers, assignPermission, removePermission } from "@/services/permissionsService";
import { Input } from "@/components/ui/input";

const ADMIN_PERMISSIONS: Array<{
  value: AdminPermission;
  label: string;
  icon: any;
  description: string;
}> = [
  {
    value: 'manage_gas_orders',
    label: 'Gas Orders',
    icon: ShoppingCart,
    description: 'Manage gas cylinder orders'
  },
  {
    value: 'manage_shop_orders',
    label: 'Shop Orders',
    icon: Package,
    description: 'Manage shop and marketplace orders'
  },
  {
    value: 'manage_commissions',
    label: 'Commissions & Withdrawals',
    icon: DollarSign,
    description: 'Manage referral commissions and withdrawals'
  },
  {
    value: 'manage_users',
    label: 'Users',
    icon: Users,
    description: 'Manage user permissions'
  },
  {
    value: 'manage_marketing',
    label: 'Marketing',
    icon: Megaphone,
    description: 'Manage bulk SMS and marketing campaigns'
  },
  {
    value: 'manage_gadgets',
    label: 'Gadgets',
    icon: Smartphone,
    description: 'Manage gadget listings'
  },
  {
    value: 'manage_brands',
    label: 'Brands',
    icon: Tag,
    description: 'Manage gas cylinder brands'
  },
  {
    value: 'manage_businesses',
    label: 'Businesses',
    icon: Building2,
    description: 'Manage business listings'
  },
  {
    value: 'manage_products',
    label: 'Products',
    icon: ShoppingBag,
    description: 'Manage business products'
  },
  {
    value: 'manage_seller_applications',
    label: 'Seller Applications',
    icon: UserCheck,
    description: 'Manage seller applications'
  },
  {
    value: 'manage_promotions',
    label: 'Promotions',
    icon: Sparkles,
    description: 'Manage promotional offers'
  },
  {
    value: 'manage_carousel',
    label: 'Carousel',
    icon: Image,
    description: 'Manage carousel images'
  }
];

export const UserManagement = () => {
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithPermissions[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.full_name?.toLowerCase().includes(term) ||
            user.display_name?.toLowerCase().includes(term) ||
            user.phone_number?.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = async (permission: AdminPermission, hasPermission: boolean) => {
    if (!selectedUser) return;

    try {
      if (hasPermission) {
        await removePermission(selectedUser.id, permission);
        toast.success(`Removed ${permission} permission`);
      } else {
        await assignPermission(selectedUser.id, permission);
        toast.success(`Granted ${permission} permission`);
      }
      
      await loadUsers();
      
      const updatedUser = users.find(u => u.id === selectedUser.id);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
    } catch (error) {
      console.error("Error updating permission:", error);
      toast.error("Failed to update permission");
    }
  };

  const openPermissionsDialog = (user: UserWithPermissions) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleLongPress = (user: UserWithPermissions) => {
    let pressTimer: NodeJS.Timeout;
    
    const startPress = () => {
      pressTimer = setTimeout(() => {
        openPermissionsDialog(user);
      }, 500);
    };
    
    const cancelPress = () => {
      clearTimeout(pressTimer);
    };
    
    return { startPress, cancelPress };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Search by name or phone..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md"
      />

      <div className="grid gap-3">
        {filteredUsers.map((user) => {
          const { startPress, cancelPress } = handleLongPress(user);
          
          return (
            <Card 
              key={user.id}
              className="cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98] select-none"
              onMouseDown={startPress}
              onMouseUp={cancelPress}
              onMouseLeave={cancelPress}
              onTouchStart={startPress}
              onTouchEnd={cancelPress}
              onContextMenu={(e) => {
                e.preventDefault();
                openPermissionsDialog(user);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-foreground">
                      {user.full_name || user.display_name || 'No name'}
                    </div>
                    {user.phone_number && (
                      <div className="text-sm text-muted-foreground">
                        {user.phone_number}
                      </div>
                    )}
                    {user.permissions.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {user.permissions.length} permission(s)
                      </div>
                    )}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Long press
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No users found
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Permissions: {selectedUser?.full_name || selectedUser?.display_name || 'User'}
            </DialogTitle>
            {selectedUser?.phone_number && (
              <div className="text-sm text-muted-foreground">
                {selectedUser.phone_number}
              </div>
            )}
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {ADMIN_PERMISSIONS.map((permission) => {
              const hasPermission = selectedUser?.permissions.includes(permission.value) || false;
              const Icon = permission.icon;

              return (
                <div
                  key={permission.value}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/5 transition-colors"
                >
                  <Checkbox
                    id={permission.value}
                    checked={hasPermission}
                    onCheckedChange={() => handlePermissionChange(permission.value, hasPermission)}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={permission.value}
                      className="flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Icon className="w-4 h-4" />
                      {permission.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {permission.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
