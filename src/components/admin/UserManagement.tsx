import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  getAllUsers, 
  assignPermission, 
  removePermission, 
  AdminPermission, 
  UserWithPermissions 
} from "@/services/permissionsService";
import { Users, Crown, MoreVertical, Search, Settings } from "lucide-react";

const ADMIN_PERMISSIONS: { value: AdminPermission; label: string; icon: string }[] = [
  { value: 'manage_orders', label: 'Manage Orders', icon: '📦' },
  { value: 'manage_withdrawals', label: 'Manage Withdrawals', icon: '💰' },
  { value: 'manage_gadgets', label: 'Manage Gadgets', icon: '📱' },
  { value: 'manage_brands', label: 'Manage Brands', icon: '🏷️' },
  { value: 'manage_businesses', label: 'Manage Businesses', icon: '🏪' },
  { value: 'manage_products', label: 'Manage Products', icon: '🛍️' },
  { value: 'manage_seller_applications', label: 'Manage Seller Applications', icon: '📋' },
  { value: 'manage_promotions', label: 'Manage Promotions', icon: '🎯' },
  { value: 'manage_carousel', label: 'Manage Carousel', icon: '🎠' },
  { value: 'manage_marketplace_settings', label: 'Manage Marketplace Settings', icon: '⚙️' },
];

export const UserManagement = () => {
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(null);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [updatingPermissions, setUpdatingPermissions] = useState<Set<string>>(new Set());
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const userData = await getAllUsers();
      setUsers(userData);
      setFilteredUsers(userData);
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

  useEffect(() => {
    const filtered = users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.display_name?.toLowerCase().includes(searchLower) ||
        user.full_name?.toLowerCase().includes(searchLower) ||
        user.phone_number?.includes(searchTerm)
      );
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

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
      
      await loadUsers();
      
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

  const handleLongPressStart = (user: UserWithPermissions) => {
    const timer = setTimeout(() => {
      setSelectedUser(user);
      setShowPermissionDialog(true);
    }, 500); // 500ms long press
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleRightClick = (e: React.MouseEvent, user: UserWithPermissions) => {
    e.preventDefault();
    setSelectedUser(user);
    setShowPermissionDialog(true);
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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h2 className="text-xl font-semibold">User Management</h2>
          <Badge variant="secondary">{filteredUsers.length} users</Badge>
        </div>
        <div className="flex items-center gap-2 max-w-sm flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8"
          />
        </div>
      </div>

      {/* User List - Compact View */}
      <div className="space-y-2">
        {filteredUsers.map((user) => (
          <div 
            key={user.id}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer select-none"
            onTouchStart={() => handleLongPressStart(user)}
            onTouchEnd={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onContextMenu={(e) => handleRightClick(e, user)}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {(user.display_name || user.full_name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">
                    {user.display_name || user.full_name || 'Unknown User'}
                  </h3>
                  {user.referral_count > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1 text-xs">
                      <Crown className="h-3 w-3" />
                      {user.referral_count}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {user.phone_number && <span>{user.phone_number}</span>}
                  <span>•</span>
                  <span>{user.permissions.length} permissions</span>
                  {user.permissions.length > 0 && (
                    <>
                      <span>•</span>
                      <div className="flex gap-1">
                        {user.permissions.slice(0, 3).map(perm => {
                          const permData = ADMIN_PERMISSIONS.find(p => p.value === perm);
                          return (
                            <span key={perm} className="text-xs">
                              {permData?.icon}
                            </span>
                          );
                        })}
                        {user.permissions.length > 3 && (
                          <span className="text-xs">+{user.permissions.length - 3}</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop 3-dots menu */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-background border shadow-lg">
                  <DropdownMenuLabel>Manage User</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      setSelectedUser(user);
                      setShowPermissionDialog(true);
                    }}
                    className="cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Permissions
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No users found</p>
        </div>
      )}

      {/* Permission Management Dialog */}
      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent className="max-w-md bg-background">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Manage Permissions
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedUser?.display_name || selectedUser?.full_name || 'Unknown User'}
            </p>
          </DialogHeader>
          
          <div className="space-y-3 mt-4">
            {ADMIN_PERMISSIONS.map((permission) => {
              const key = `${selectedUser?.id}-${permission.value}`;
              const isChecked = selectedUser?.permissions.includes(permission.value) || false;
              const isUpdating = updatingPermissions.has(key);

              return (
                <div key={permission.value} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{permission.icon}</span>
                    <div>
                      <label className={`text-sm font-medium ${isUpdating ? 'opacity-50' : ''}`}>
                        {permission.label}
                      </label>
                    </div>
                  </div>
                  <Checkbox
                    checked={isChecked}
                    disabled={isUpdating || !selectedUser}
                    onCheckedChange={(checked) => {
                      if (selectedUser) {
                        handlePermissionChange(selectedUser.id, permission.value, checked as boolean);
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};