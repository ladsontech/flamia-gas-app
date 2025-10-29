import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Save, X } from "lucide-react";
import type { UserWithPermissions, AdminPermission } from "@/services/permissionsService";
import { getAllUsers, assignPermission, removePermission } from "@/services/permissionsService";

const AVAILABLE_PERMISSIONS: { value: AdminPermission; label: string; description: string }[] = [
  { value: 'manage_gas_orders', label: 'Gas Orders', description: 'Manage gas orders' },
  { value: 'manage_shop_orders', label: 'Shop Orders', description: 'Manage shop orders' },
  { value: 'manage_users', label: 'Users', description: 'Manage users' },
  { value: 'manage_commissions', label: 'Commissions & Withdrawals', description: 'Referral payouts' },
  { value: 'manage_marketing', label: 'Marketing', description: 'Bulk SMS & Ads' },
  { value: 'manage_gadgets', label: 'Gadgets', description: 'Manage gadgets' },
  { value: 'manage_brands', label: 'Brands', description: 'Manage brands' },
  { value: 'manage_businesses', label: 'Businesses', description: 'Manage businesses' },
  { value: 'manage_products', label: 'Products', description: 'Manage products' },
  { value: 'manage_seller_applications', label: 'Seller Applications', description: 'Review seller applications' },
  { value: 'manage_promotions', label: 'Promotions', description: 'Manage promotions' },
  { value: 'manage_carousel', label: 'Carousel', description: 'Manage carousel' },
];

export const SubAdminManager = () => {
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithPermissions[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<AdminPermission[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

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
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user: UserWithPermissions) => {
    setSelectedUser(user);
    setSelectedPermissions(user.permissions || []);
  };

  const handlePermissionToggle = (permission: AdminPermission) => {
    setSelectedPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      const currentPermissions = selectedUser.permissions || [];
      const toAdd = selectedPermissions.filter(p => !currentPermissions.includes(p));
      const toRemove = currentPermissions.filter(p => !selectedPermissions.includes(p));

      for (const permission of toAdd) {
        await assignPermission(selectedUser.id, permission);
      }

      for (const permission of toRemove) {
        await removePermission(selectedUser.id, permission);
      }

      toast({
        title: "Success",
        description: "Permissions updated successfully"
      });

      await loadUsers();
      setSelectedUser(null);
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast({
        title: "Error",
        description: "Failed to update permissions",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
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
      {!selectedUser ? (
        <>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="grid gap-3">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleSelectUser(user)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">
                        {user.full_name || user.display_name || 'No name'}
                      </div>
                      {user.phone_number && (
                        <div className="text-sm text-muted-foreground">
                          {user.phone_number}
                        </div>
                      )}
                      {user.permissions && user.permissions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {user.permissions.slice(0, 3).map(perm => (
                            <Badge key={perm} variant="secondary" className="text-xs">
                              {AVAILABLE_PERMISSIONS.find(p => p.value === perm)?.label}
                            </Badge>
                          ))}
                          {user.permissions.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{user.permissions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <Button size="sm" variant="ghost">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            )}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedUser.full_name || selectedUser.display_name || 'No name'}
                </h3>
                {selectedUser.phone_number && (
                  <p className="text-sm text-muted-foreground">{selectedUser.phone_number}</p>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">Assign Permissions</Label>
              <div className="grid gap-3">
                {AVAILABLE_PERMISSIONS.map((permission) => (
                  <div key={permission.value} className="flex items-start space-x-3 p-3 rounded-lg border">
                    <Checkbox
                      id={permission.value}
                      checked={selectedPermissions.includes(permission.value)}
                      onCheckedChange={() => handlePermissionToggle(permission.value)}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={permission.value}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {permission.label}
                      </label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Permissions"}
              </Button>
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
