import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  getAllUsers, 
  assignPermission, 
  removePermission, 
  AdminPermission, 
  UserWithPermissions 
} from "@/services/permissionsService";
import { Users, Crown } from "lucide-react";

const ADMIN_PERMISSIONS: { value: AdminPermission; label: string }[] = [
  { value: 'manage_orders', label: 'Manage Orders' },
  { value: 'manage_withdrawals', label: 'Manage Withdrawals' },
  { value: 'manage_gadgets', label: 'Manage Gadgets' },
  { value: 'manage_brands', label: 'Manage Brands' },
  { value: 'manage_businesses', label: 'Manage Businesses' },
  { value: 'manage_products', label: 'Manage Products' },
  { value: 'manage_seller_applications', label: 'Manage Seller Applications' },
  { value: 'manage_promotions', label: 'Manage Promotions' },
  { value: 'manage_carousel', label: 'Manage Carousel' },
  { value: 'manage_marketplace_settings', label: 'Manage Marketplace Settings' },
];

export const UserManagement = () => {
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingPermissions, setUpdatingPermissions] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const loadUsers = async () => {
    try {
      const userData = await getAllUsers();
      setUsers(userData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handlePermissionChange = async (
    userId: string, 
    permission: AdminPermission, 
    checked: boolean
  ) => {
    const key = `${userId}-${permission}`;
    setUpdatingPermissions(prev => new Set(prev).add(key));

    try {
      if (checked) {
        await assignPermission(userId, permission);
      } else {
        await removePermission(userId, permission);
      }
      
      await loadUsers(); // Refresh data
      
      toast({
        title: "Success",
        description: `Permission ${checked ? 'assigned' : 'removed'} successfully`
      });
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: "Error",
        description: "Failed to update permission",
        variant: "destructive"
      });
    } finally {
      setUpdatingPermissions(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        <h2 className="text-xl font-semibold">User Management</h2>
        <Badge variant="secondary">{users.length} users</Badge>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {user.display_name || user.full_name || 'Unknown User'}
                      {user.referral_count > 0 && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Crown className="h-3 w-3" />
                          {user.referral_count} referrals
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {user.phone_number && `${user.phone_number} • `}
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {user.permissions.length} permissions
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Admin Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ADMIN_PERMISSIONS.map((permission) => {
                    const key = `${user.id}-${permission.value}`;
                    const isChecked = user.permissions.includes(permission.value);
                    const isUpdating = updatingPermissions.has(key);

                    return (
                      <div key={permission.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={isChecked}
                          disabled={isUpdating}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(user.id, permission.value, checked as boolean)
                          }
                        />
                        <label 
                          htmlFor={key}
                          className={`text-sm ${isUpdating ? 'opacity-50' : ''}`}
                        >
                          {permission.label}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};