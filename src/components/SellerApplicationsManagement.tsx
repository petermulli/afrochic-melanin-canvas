import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, Clock, Eye } from "lucide-react";

interface SellerApplication {
  id: string;
  user_id: string;
  business_name: string;
  business_description: string | null;
  phone: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const SellerApplicationsManagement = () => {
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<SellerApplication | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("seller_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    setProcessing(true);

    try {
      // Update application status
      const { error: updateError } = await supabase
        .from("seller_applications")
        .update({ status: "approved", admin_notes: adminNotes || null })
        .eq("id", selectedApp.id);

      if (updateError) throw updateError;

      // Create seller profile
      const { error: profileError } = await supabase
        .from("seller_profiles")
        .insert({
          user_id: selectedApp.user_id,
          business_name: selectedApp.business_name,
          business_description: selectedApp.business_description,
        });

      if (profileError) throw profileError;

      // Add seller role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: selectedApp.user_id, role: "seller" });

      if (roleError && roleError.code !== "23505") throw roleError;

      toast.success("Seller approved successfully!");
      setDialogOpen(false);
      fetchApplications();
    } catch (error: any) {
      console.error("Error approving seller:", error);
      toast.error("Failed to approve seller");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    if (!adminNotes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setProcessing(true);

    try {
      const { error } = await supabase
        .from("seller_applications")
        .update({ status: "rejected", admin_notes: adminNotes })
        .eq("id", selectedApp.id);

      if (error) throw error;

      toast.success("Application rejected");
      setDialogOpen(false);
      fetchApplications();
    } catch (error: any) {
      console.error("Error rejecting application:", error);
      toast.error("Failed to reject application");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-500 gap-1"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Seller Applications</h2>
        <p className="text-muted-foreground mt-1">
          Review and approve seller applications
        </p>
      </div>

      {applications.length === 0 ? (
        <p className="text-muted-foreground">No applications found</p>
      ) : (
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.business_name}</TableCell>
                  <TableCell>{app.phone}</TableCell>
                  <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedApp(app);
                        setAdminNotes(app.admin_notes || "");
                        setDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div>
                <strong>Business Name:</strong> {selectedApp.business_name}
              </div>
              <div>
                <strong>Phone:</strong> {selectedApp.phone}
              </div>
              {selectedApp.business_description && (
                <div>
                  <strong>Description:</strong>
                  <p className="text-muted-foreground mt-1">{selectedApp.business_description}</p>
                </div>
              )}
              <div>
                <strong>Status:</strong> {getStatusBadge(selectedApp.status)}
              </div>
              
              {selectedApp.status === "pending" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Notes</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Optional notes (required for rejection)"
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedApp?.status === "pending" && (
              <>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={processing}
                >
                  {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Approve
                </Button>
              </>
            )}
            {selectedApp?.status !== "pending" && (
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerApplicationsManagement;