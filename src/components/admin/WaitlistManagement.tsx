import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, CheckCircle, Search, Trash2, Clock } from "lucide-react";
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

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  skin_description: string | null;
  product_requested: string;
  is_served: boolean;
  notified_at: string | null;
  created_at: string;
}

const WaitlistManagement = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWaitlist();

    const channel = supabase
      .channel('waitlist-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'waitlist' }, () => {
        fetchWaitlist();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchWaitlist = async () => {
    try {
      const { data, error } = await supabase
        .from("waitlist")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching waitlist:", error);
      toast.error("Failed to fetch waitlist");
    } finally {
      setLoading(false);
    }
  };

  const handleNotify = async (entry: WaitlistEntry) => {
    setNotifyingId(entry.id);
    try {
      // Invoke edge function to send email
      const { error: functionError } = await supabase.functions.invoke("send-waitlist-notification", {
        body: {
          email: entry.email,
          name: entry.name,
          productRequested: entry.product_requested,
        },
      });

      if (functionError) throw functionError;

      // Update the entry as notified
      const { error: updateError } = await supabase
        .from("waitlist")
        .update({ notified_at: new Date().toISOString() })
        .eq("id", entry.id);

      if (updateError) throw updateError;

      // Log admin action
      await supabase.from("admin_action_logs").insert({
        admin_id: user?.id,
        action_type: "notify_waitlist",
        target_type: "waitlist",
        target_id: entry.id,
        details: { email: entry.email, product: entry.product_requested },
      });

      toast.success(`Notification sent to ${entry.email}`);
      fetchWaitlist();
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification");
    } finally {
      setNotifyingId(null);
    }
  };

  const handleMarkServed = async (entry: WaitlistEntry) => {
    try {
      const { error } = await supabase
        .from("waitlist")
        .update({ is_served: true })
        .eq("id", entry.id);

      if (error) throw error;

      // Log admin action
      await supabase.from("admin_action_logs").insert({
        admin_id: user?.id,
        action_type: "mark_served",
        target_type: "waitlist",
        target_id: entry.id,
        details: { email: entry.email, product: entry.product_requested },
      });

      toast.success("Marked as served");
      fetchWaitlist();
    } catch (error) {
      console.error("Error marking as served:", error);
      toast.error("Failed to update");
    }
  };

  const handleClearServed = async () => {
    try {
      const { error } = await supabase
        .from("waitlist")
        .delete()
        .eq("is_served", true);

      if (error) throw error;

      // Log admin action
      await supabase.from("admin_action_logs").insert({
        admin_id: user?.id,
        action_type: "clear_served_waitlist",
        target_type: "waitlist",
        target_id: null,
        details: { cleared_count: entries.filter(e => e.is_served).length },
      });

      toast.success("Cleared all served entries");
      fetchWaitlist();
    } catch (error) {
      console.error("Error clearing served entries:", error);
      toast.error("Failed to clear");
    }
  };

  const filteredEntries = entries.filter(
    (entry) =>
      !entry.is_served && (
        entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.product_requested.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const servedCount = entries.filter(e => e.is_served).length;
  const pendingCount = entries.filter(e => !e.is_served).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Product Waitlist
            </CardTitle>
            <CardDescription>
              {pendingCount} pending requests • {servedCount} served
            </CardDescription>
          </div>
          {servedCount > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Served ({servedCount})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Served Entries?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {servedCount} served entries from the waitlist.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearServed}>Clear All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No pending waitlist entries
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Skin Condition</TableHead>
                  <TableHead>Product Requested</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{entry.email}</p>
                        <p className="text-muted-foreground">{entry.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {entry.skin_description || "-"}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="truncate">{entry.product_requested}</p>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {entry.notified_at ? (
                        <Badge variant="secondary">Notified</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleNotify(entry)}
                          disabled={notifyingId === entry.id}
                        >
                          {notifyingId === entry.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Mail className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleMarkServed(entry)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WaitlistManagement;
