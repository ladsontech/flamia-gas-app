import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserPlus, Shield } from "lucide-react";
import {
  getAllPermissions,
  getPermissionLabels,
  getAllUsersWithPermissions,
  grantPermission,
  revokePermission,
  AdminPermission
} from "@/services/permissionsService";
import { supabase } from "@/integrations/supabase/client";

export const PermissionsManager = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchUser, setSearchUser] = useState<any>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<AdminPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const allPermissions = getAllPermissions();
  const permissionLabels = getPermissionLabels();

  useEffect(() => {
    loadUsersWithPermissions();
  }, []);

  const loadUsersWithPermissions = async () => {
    try {
      const usersWithPermissions = await getAllUsersWithPermissions();
      setUsers(usersWithPermissions);
    } catch (error) {
      console.error('Error loading users with permissions:', error);
      toast({
        title: "Error",
        description: "Failed to load users with permissions",
        variant: "destructive"
      });
    }
  };

  const searchUserByEmail = async () => {
    if (!searchEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Search in profiles table first
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .or(`full_name.ilike.%${searchEmail}%,display_name.ilike.%${searchEmail}%`);

      if (profileError) throw profileError;

      if (profiles && profiles.length > 0) {
        setSearchUser(profiles[0]);
        setSelectedPermissions([]);
      } else {
        toast({
          title: "User not found",
          description: "No user found with that email or name",
          variant: "destructive"
        });
        setSearchUser(null);
      }
    } catch (error) {
      console.error('Error searching user:', error);
      toast({
        title: "Error",
        description: "Failed to search for user",
        variant: "destructive"
      });
      setSearchUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permission: AdminPermission, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permission]);
    } else {
      setSelectedPermissions(prev => prev.filter(p => p !== permission));
    }
  };

  const grantPermissions = async () => {
    if (!searchUser || selectedPermissions.length === 0) {
      toast({
        title: "Error",
        description: "Please select a user and at least one permission",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      for (const permission of selectedPermissions) {
        await grantPermission(searchUser.id, permission);
      }

      toast({
        title: "Success",
        description: `Granted ${selectedPermissions.length} permissions to ${searchUser.display_name || searchUser.full_name}`,
      });

      setSearchUser(null);
      setSearchEmail("");
      setSelectedPermissions([]);
      loadUsersWithPermissions();
    } catch (error) {
      console.error('Error granting permissions:', error);
      toast({
        title: "Error",
        description: "Failed to grant permissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const revokeUserPermission = async (userId: string, permission: AdminPermission) => {
    setLoading(true);
    try {
      await revokePermission(userId, permission);
      toast({
        title: "Success",
        description: "Permission revoked successfully",
      });
      loadUsersWithPermissions();
    } catch (error) {
      console.error('Error revoking permission:', error);
      toast({
        title: "Error",
        description: "Failed to revoke permission",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Permissions Manager
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="grant" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grant">Grant Permissions</TabsTrigger>
          <TabsTrigger value="manage">Manage Users</TabsTrigger>
        </TabsList>

        <TabsContent value="grant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Grant Permissions to User
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="search-email">Search User by Email or Name</Label>
                  <Input
                    id="search-email"
                    type="text"
                    placeholder="Enter email or name"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                  />
                </div>
                <Button onClick={searchUserByEmail} disabled={loading} className="mt-6">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              {searchUser && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <div>
                    <Label>Selected User:</Label>
                    <p className="font-medium">{searchUser.display_name || searchUser.full_name || 'Unknown'}</p>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Select Permissions:</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      {allPermissions.map((permission) => (
                        <div key={permission} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission}
                            checked={selectedPermissions.includes(permission)}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(permission, checked as boolean)
                            }
                          />
                          <Label
                            htmlFor={permission}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {permissionLabels[permission]}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={grantPermissions} 
                    disabled={loading || selectedPermissions.length === 0}
                    className="w-full"
                  >
                    Grant Selected Permissions
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Users with Admin Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-muted-foreground">No users with admin permissions found.</p>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.user_id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{user.name}</h4>
                          <p className="text-sm text-muted-foreground">User ID: {user.user_id}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Permissions:</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          {user.permissions.map((permission: AdminPermission) => (
                            <div key={permission} className="flex items-center justify-between bg-muted p-2 rounded">
                              <span className="text-sm">{permissionLabels[permission]}</span>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => revokeUserPermission(user.user_id, permission)}
                                disabled={loading}
                              >
                                Revoke
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};