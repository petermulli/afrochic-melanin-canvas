import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";

interface WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchQuery?: string;
}

const WaitlistDialog = ({ open, onOpenChange, searchQuery = "" }: WaitlistDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    skinDescription: "",
    productRequested: searchQuery,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.productRequested) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("waitlist").insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        skin_description: formData.skinDescription || null,
        product_requested: formData.productRequested,
      });

      if (error) throw error;

      toast.success("You've been added to the waitlist! We'll notify you when the product is available.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        skinDescription: "",
        productRequested: "",
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error submitting waitlist:", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Can't Find What You're Looking For?
          </DialogTitle>
          <DialogDescription>
            Let us know what product you're looking for and we'll notify you when it's available.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+254 700 000 000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skinDescription">What are we treating? (Skin Condition)</Label>
            <Textarea
              id="skinDescription"
              placeholder="E.g., Acne, dark spots, hyperpigmentation, dry skin..."
              value={formData.skinDescription}
              onChange={(e) => setFormData({ ...formData, skinDescription: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productRequested">Product You're Looking For *</Label>
            <Textarea
              id="productRequested"
              placeholder="Describe the product you're searching for..."
              value={formData.productRequested}
              onChange={(e) => setFormData({ ...formData, productRequested: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Join Waitlist"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistDialog;
