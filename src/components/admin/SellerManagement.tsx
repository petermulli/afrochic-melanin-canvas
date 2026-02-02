import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Eye, UserX, UserCheck, Trash2, Store, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SellerProfile {
  id: string;
  user_id: string;
  business_name: string;
  shop_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  created_at: string;
  is_profile_complete: boolean | null;
}

const SellerManagement = () => {
  const { user } = useAuth();
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeller, setSelectedSeller] = useState<SellerProfile | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const { data, error } = await supabase
        .from("seller_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSellers(data || []);
    } catch (error) {
      console.error("Error fetching sellers:", error);
      toast.error("Failed to fetch sellers");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (seller: SellerProfile, suspend: boolean) => {
    setProcessing(true);
    try {
      // Update the seller profile suspension status
      const { error } = await supabase
        .from("seller_profiles")
        .update({ is_profile_complete: !suspend }) // Using is_profile_complete as suspension proxy
        .eq("id", seller.id);

      if (error) throw error;

      // Log the action
      await supabase.from("admin_action_logs").insert({
        admin_id: user?.id,
        action_type: suspend ? "suspend_seller" : "unsuspend_seller",
        target_type: "seller",
        target_id: seller.id,
        details: { business_name: seller.business_name },
      });

      toast.success(suspend ? "Seller suspended" : "Seller unsuspended");
      fetchSellers();
      setDetailsOpen(false);
    } catch (error) {
      console.error("Error updating seller:", error);
      toast.error("Failed to update seller status");
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveSeller = async () => {
    if (!selectedSeller) return;
    setProcessing(true);

    try {
      // Remove seller role
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", selectedSeller.user_id)
        .eq("role", "seller");

      if (roleError) throw roleError;

      // Remove seller profile
      const { error: profileError } = await supabase
        .from("seller_profiles")
        .delete()
        .eq("id", selectedSeller.id);

      if (profileError) throw profileError;

      // Log the action
      await supabase.from("admin_action_logs").insert({
        admin_id: user?.id,
        action_type: "remove_seller",
        target_type: "seller",
        target_id: selectedSeller.id,
        details: { business_name: selectedSeller.business_name },
      });

      toast.success("Seller removed successfully");
      setDeleteDialogOpen(false);
      setDetailsOpen(false);
      fetchSellers();
    } catch (error) {
      console.error("Error removing seller:", error);
      toast.error("Failed to remove seller");
    } finally {
      setProcessing(false);
    }
  };

  const filteredSellers = sellers.filter(
    (seller) =>
      seller.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.shop_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Store className="h-6 w-6" />
            Approved Sellers
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage approved sellers on the platform
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sellers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredSellers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery ? "No sellers match your search" : "No approved sellers yet"}
        </div>
      ) : (
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Shop Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSellers.map((seller) => (
                <TableRow key={seller.id}>
                  <TableCell className="font-medium">{seller.business_name}</TableCell>
                  <TableCell>{seller.shop_name || "-"}</TableCell>
                  <TableCell>{seller.city || "-"}</TableCell>
                  <TableCell>{new Date(seller.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={seller.is_profile_complete === false ? "destructive" : "default"}>
                      {seller.is_profile_complete === false ? "Suspended" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSeller(seller);
                        setDetailsOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Seller Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Seller Details</DialogTitle>
          </DialogHeader>
          {selectedSeller && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Business Name</p>
                  <p>{selectedSeller.business_name}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Shop Name</p>
                  <p>{selectedSeller.shop_name || "-"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Email</p>
                  <p>{selectedSeller.email || "-"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Phone</p>
                  <p>{selectedSeller.phone || "-"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">City</p>
                  <p>{selectedSeller.city || "-"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Joined</p>
                  <p>{new Date(selectedSeller.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={selectedSeller.is_profile_complete === false ? "destructive" : "default"}>
                  {selectedSeller.is_profile_complete === false ? "Suspended" : "Active"}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedSeller && (
              <>
                {selectedSeller.is_profile_complete === false ? (
                  <Button
                    variant="outline"
                    onClick={() => handleSuspend(selectedSeller, false)}
                    disabled={processing}
                    className="gap-2"
                  >
                    <UserCheck className="h-4 w-4" />
                    Unsuspend
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => handleSuspend(selectedSeller, true)}
                    disabled={processing}
                    className="gap-2"
                  >
                    <UserX className="h-4 w-4" />
                    Suspend
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={processing}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove Seller
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Seller</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this seller? This will revoke their selling privileges and delete their seller profile. Their products will remain but they won't be able to manage them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveSeller}
              disabled={processing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Remove Seller
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SellerManagement;
