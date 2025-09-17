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
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <h3 className="text-base font-medium">Users</h3>
          <Badge variant="secondary" className="text-xs">{filteredUsers.length}</Badge>
        </div>
        <div className="flex items-center gap-1 flex-1 max-w-xs">
          <Search className="h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-7 text-sm"
          />
        </div>
      </div>

      {/* User List - Mobile Optimized */}
      <div className="space-y-1">
        {filteredUsers.map((user) => (
          <div 
            key={user.id}
            className="flex items-center justify-between p-2 rounded-md border hover:bg-muted/50 transition-colors cursor-pointer select-none"
            onTouchStart={() => handleLongPressStart(user)}
            onTouchEnd={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onContextMenu={(e) => handleRightClick(e, user)}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium">
                  {(user.display_name || user.full_name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <h3 className="text-sm font-medium truncate">
                    {user.display_name || user.full_name || 'Unknown'}
                  </h3>
                  {user.referral_count > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1 text-xs px-1 py-0 h-4">
                      <Crown className="h-2 w-2" />
                      {user.referral_count}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>{user.permissions.length}p</span>
                  {user.permissions.length > 0 && (
                    <>
                      <span>•</span>
                      <div className="flex gap-0.5">
                        {user.permissions.slice(0, 4).map(perm => {
                          const permData = ADMIN_PERMISSIONS.find(p => p.value === perm);
                          return (
                            <span key={perm} className="text-xs">
                              {permData?.icon}
                            </span>
                          );
                        })}
                        {user.permissions.length > 4 && (
                          <span className="text-xs">+{user.permissions.length - 4}</span>
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
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 bg-background border shadow-lg z-50">
                  <DropdownMenuLabel className="text-xs">Manage User</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      setSelectedUser(user);
                      setShowPermissionDialog(true);
                    }}
                    className="cursor-pointer text-xs"
                  >
                    <Settings className="mr-1 h-3 w-3" />
                    Permissions
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-4 text-muted-foreground">
          <Users className="h-6 w-6 mx-auto mb-1 opacity-50" />
          <p className="text-sm">No users found</p>
        </div>
      )}

      {/* Permission Management Dialog */}
      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent className="max-w-sm bg-background mx-2">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4" />
              Permissions
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              {selectedUser?.display_name || selectedUser?.full_name || 'Unknown User'}
            </p>
          </DialogHeader>
          
          <div className="space-y-2 mt-3 max-h-80 overflow-y-auto">
            {ADMIN_PERMISSIONS.map((permission) => {
              const key = `${selectedUser?.id}-${permission.value}`;
              const isChecked = selectedUser?.permissions.includes(permission.value) || false;
              const isUpdating = updatingPermissions.has(key);

              return (
                <div key={permission.value} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{permission.icon}</span>
                    <div>
                      <label className={`text-xs font-medium ${isUpdating ? 'opacity-50' : ''}`}>
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
                    className="h-4 w-4"
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