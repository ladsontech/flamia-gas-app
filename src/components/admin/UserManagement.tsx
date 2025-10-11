import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { UserWithPermissions } from "@/services/permissionsService";
import { getAllUsers } from "@/services/permissionsService";


export const UserManagement = () => {
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithPermissions[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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
    } finally {
      setLoading(false);
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
      <Input
        type="text"
        placeholder="Search by name or phone..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md"
      />

      <div className="grid gap-3">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
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
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  {user.referral_count} referral{user.referral_count !== 1 ? 's' : ''}
                </div>
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
    </div>
  );
};
