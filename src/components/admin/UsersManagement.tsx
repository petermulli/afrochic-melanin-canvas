import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSuperadmin } from "@/hooks/useSuperadmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, Search, UserX, UserCheck, Circle, Trash2 } from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  is_suspended: boolean;
  last_seen: string | null;
  created_at: string | null;
  roles: string[];
}

const UsersManagement = () => {
  const { user } = useAuth();
  const { isSuperadmin } = useSuperadmin();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Map roles to users
      const usersWithRoles = (profiles || []).map((profile) => ({
        ...profile,
        roles: (roles || [])
          .filter((r) => r.user_id === profile.id)
          .map((r) => r.role),
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const toggleSuspension = async (userId: string, currentlySuspended: boolean) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_suspended: !currentlySuspended })
        .eq("id", userId);

      if (error) throw error;

      // Log the action
      await supabase.from("admin_action_logs").insert({
        admin_id: user?.id,
        action_type: currentlySuspended ? "unsuspend_user" : "suspend_user",
        target_type: "user",
        target_id: userId,
      });

      setUsers(users.map((u) =>
        u.id === userId ? { ...u, is_suspended: !currentlySuspended } : u
      ));

      toast.success(currentlySuspended ? "User unsuspended" : "User suspended");
    } catch (error) {
      console.error("Error toggling suspension:", error);
      toast.error("Failed to update user status");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId: string, userName: string | null) => {
    setActionLoading(userId);
    try {
      // Delete user roles first
      const { error: rolesError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (rolesError) throw rolesError;

      // Delete profile (this will cascade if properly set up)
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (profileError) throw profileError;

      // Log the action
      await supabase.from("admin_action_logs").insert({
        admin_id: user?.id,
        action_type: "delete_user",
        target_type: "user",
        target_id: userId,
        details: { user_name: userName },
      });

      setUsers(users.filter((u) => u.id !== userId));
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  const isOnline = (lastSeen: string | null) => {
    if (!lastSeen) return false;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(lastSeen) > fiveMinutesAgo;
  };

  const filteredUsers = users.filter((u) =>
    (u.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.phone || "").includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline">
          {filteredUsers.length} users
        </Badge>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Circle
                      className={`h-3 w-3 ${
                        isOnline(u.last_seen)
                          ? "fill-green-500 text-green-500"
                          : "fill-gray-300 text-gray-300"
                      }`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {u.full_name || "—"}
                    {u.is_suspended && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        Suspended
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{u.phone || "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {u.roles.length > 0 ? (
                        u.roles.map((role) => (
                          <Badge key={role} variant="secondary" className="text-xs">
                            {role}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline" className="text-xs">user</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {u.created_at
                      ? new Date(u.created_at).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {u.last_seen
                      ? new Date(u.last_seen).toLocaleString()
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {/* Suspend/Unsuspend Button */}
                      <Button
                        variant={u.is_suspended ? "default" : "destructive"}
                        size="sm"
                        disabled={actionLoading === u.id || u.roles.includes("admin")}
                        onClick={() => toggleSuspension(u.id, u.is_suspended)}
                      >
                        {actionLoading === u.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : u.is_suspended ? (
                          <>
                            <UserCheck className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Unsuspend</span>
                          </>
                        ) : (
                          <>
                            <UserX className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Suspend</span>
                          </>
                        )}
                      </Button>

                      {/* Delete Button */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={u.roles.includes("admin") || actionLoading === u.id}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to permanently delete {u.full_name || "this user"}? 
                              This action cannot be undone and will remove all their data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteUser(u.id, u.full_name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UsersManagement;
