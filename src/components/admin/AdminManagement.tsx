import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSuperadmin } from "@/hooks/useSuperadmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Loader2, UserPlus, Trash2, Shield, ShieldCheck, Clock } from "lucide-react";

interface Admin {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  isSuperadmin: boolean;
}

interface PendingAdmin {
  id: string;
  email: string;
  created_at: string;
}

const AdminManagement = () => {
  const { user } = useAuth();
  const { isSuperadmin, superadminEmail } = useSuperadmin();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [pendingAdmins, setPendingAdmins] = useState<PendingAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      // Fetch admin roles with profile info
      const { data: adminRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id")
        .eq("role", "admin");

      if (rolesError) throw rolesError;

      // Fetch profiles for admin users
      const adminUserIds = (adminRoles || []).map((r) => r.user_id);
      
      if (adminUserIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, phone")
          .in("id", adminUserIds);

        if (profilesError) throw profilesError;

        const adminsWithProfiles = (adminRoles || []).map((role) => {
          const profile = (profiles || []).find((p) => p.id === role.user_id);
          return {
            id: role.id,
            user_id: role.user_id,
            full_name: profile?.full_name || null,
            phone: profile?.phone || null,
            isSuperadmin: false, // We'll check this via email in the component
          };
        });

        setAdmins(adminsWithProfiles);
      } else {
        setAdmins([]);
      }

      // Fetch pending admins
      const { data: pending, error: pendingError } = await supabase
        .from("pending_admins")
        .select("*")
        .order("created_at", { ascending: false });

      if (pendingError) throw pendingError;
      setPendingAdmins(pending || []);
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  const addAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    if (!isSuperadmin) {
      toast.error("Only the Superadmin can add new admins");
      return;
    }

    setAddingAdmin(true);
    try {
      // Check if email is already a pending admin
      const { data: existing } = await supabase
        .from("pending_admins")
        .select("id")
        .eq("email", newAdminEmail.toLowerCase())
        .single();

      if (existing) {
        toast.error("This email is already pending admin approval");
        return;
      }

      // Add to pending admins
      const { error } = await supabase.from("pending_admins").insert({
        email: newAdminEmail.toLowerCase(),
        invited_by: user?.id,
      });

      if (error) throw error;

      // Log the action
      await supabase.from("admin_action_logs").insert({
        admin_id: user?.id,
        action_type: "invite_admin",
        target_type: "admin",
        target_id: newAdminEmail.toLowerCase(),
        details: { email: newAdminEmail.toLowerCase() },
      });

      toast.success(`Admin invitation sent to ${newAdminEmail}`);
      setNewAdminEmail("");
      fetchAdmins();
    } catch (error: any) {
      console.error("Error adding admin:", error);
      toast.error(error.message || "Failed to add admin");
    } finally {
      setAddingAdmin(false);
    }
  };

  const removeAdmin = async (roleId: string, userId: string) => {
    if (!isSuperadmin) {
      toast.error("Only the Superadmin can remove admins");
      return;
    }

    setRemovingId(roleId);
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;

      // Log the action
      await supabase.from("admin_action_logs").insert({
        admin_id: user?.id,
        action_type: "remove_admin",
        target_type: "admin",
        target_id: userId,
      });

      toast.success("Admin removed successfully");
      fetchAdmins();
    } catch (error) {
      console.error("Error removing admin:", error);
      toast.error("Failed to remove admin");
    } finally {
      setRemovingId(null);
    }
  };

  const removePendingAdmin = async (id: string) => {
    try {
      const { error } = await supabase
        .from("pending_admins")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Pending admin removed");
      fetchAdmins();
    } catch (error) {
      console.error("Error removing pending admin:", error);
      toast.error("Failed to remove pending admin");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Admin Section - Only for Superadmin */}
      {isSuperadmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New Admin
            </CardTitle>
            <CardDescription>
              Enter the email of the person you want to make an admin. They will need to sign up with this email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                type="email"
                placeholder="admin@example.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="max-w-md"
              />
              <Button onClick={addAdmin} disabled={addingAdmin}>
                {addingAdmin ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                Add Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Admins */}
      {pendingAdmins.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Admin Invitations
            </CardTitle>
            <CardDescription>
              These users will become admins when they sign up with their email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Invited On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingAdmins.map((pending) => (
                  <TableRow key={pending.id}>
                    <TableCell>{pending.email}</TableCell>
                    <TableCell>
                      {new Date(pending.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removePendingAdmin(pending.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Current Admins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current Admins
          </CardTitle>
          <CardDescription>
            All users with admin privileges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                {isSuperadmin && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isSuperadmin ? 4 : 3} className="text-center py-8 text-muted-foreground">
                    No admins found
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => {
                  const isThisSuperadmin = admin.user_id === user?.id && isSuperadmin;
                  return (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">
                        {admin.full_name || "—"}
                        {admin.user_id === user?.id && (
                          <Badge variant="outline" className="ml-2">You</Badge>
                        )}
                      </TableCell>
                      <TableCell>{admin.phone || "—"}</TableCell>
                      <TableCell>
                        {isThisSuperadmin ? (
                          <Badge className="bg-primary">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Superadmin
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                      </TableCell>
                      {isSuperadmin && (
                        <TableCell>
                          {!isThisSuperadmin && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={removingId === admin.id}
                                >
                                  {removingId === admin.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Remove
                                    </>
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Admin</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove admin privileges from {admin.full_name || "this user"}. 
                                    They will become a regular user.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => removeAdmin(admin.id, admin.user_id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Remove Admin
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminManagement;
