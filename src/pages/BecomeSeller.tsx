import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Store, Package, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SellerApplication {
  id: string;
  status: string;
  business_name: string;
  admin_notes?: string;
  created_at: string;
}

const BecomeSeller = () => {
  const { user } = useAuth();
  const { isSeller, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [applying, setApplying] = useState(false);
  const [application, setApplication] = useState<SellerApplication | null>(null);
  const [loadingApplication, setLoadingApplication] = useState(true);
  
  const [formData, setFormData] = useState({
    businessName: "",
    businessDescription: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      fetchApplication();
    } else {
      setLoadingApplication(false);
    }
  }, [user]);

  const fetchApplication = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("seller_applications")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setApplication(data);
    } catch (error) {
      console.error("Error fetching application:", error);
    } finally {
      setLoadingApplication(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in first");
      navigate("/auth");
      return;
    }

    if (!formData.businessName.trim() || !formData.phone.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setApplying(true);
    try {
      const { error } = await supabase
        .from("seller_applications")
        .insert({
          user_id: user.id,
          business_name: formData.businessName.trim(),
          business_description: formData.businessDescription.trim() || null,
          phone: formData.phone.trim(),
        });

      if (error) {
        if (error.code === "23505") {
          toast.info("You have already submitted an application");
        } else {
          throw error;
        }
      } else {
        toast.success("Application submitted! We'll review it shortly.");
        fetchApplication();
      }
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  if (roleLoading || loadingApplication) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isSeller) {
    navigate("/seller");
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending Review</Badge>;
      case "approved":
        return <Badge className="bg-green-500 gap-1"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Become a Seller</h1>
            <p className="text-lg text-muted-foreground">
              Join our marketplace and start selling your products today
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader className="text-center">
                <Store className="h-12 w-12 mx-auto text-primary mb-2" />
                <CardTitle>Your Own Store</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Get your own seller dashboard to manage all your products in one place
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Package className="h-12 w-12 mx-auto text-primary mb-2" />
                <CardTitle>Easy Uploads</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Upload products quickly with our simple form - add images, descriptions, and more
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-primary mb-2" />
                <CardTitle>Reach Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Your products will be visible to all shoppers on our platform
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Application Status or Form */}
          {application ? (
            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                {application.status === "pending" && (
                  <Clock className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
                )}
                {application.status === "approved" && (
                  <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                )}
                {application.status === "rejected" && (
                  <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
                )}
                <CardTitle>Application Status</CardTitle>
                <div className="mt-2">{getStatusBadge(application.status)}</div>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  <strong>Business:</strong> {application.business_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Submitted on {new Date(application.created_at).toLocaleDateString()}
                </p>
                {application.status === "pending" && (
                  <p className="text-sm">
                    Your application is being reviewed. We'll notify you once it's approved.
                  </p>
                )}
                {application.status === "approved" && (
                  <Button onClick={() => navigate("/seller")} className="w-full">
                    Go to Seller Dashboard
                  </Button>
                )}
                {application.status === "rejected" && application.admin_notes && (
                  <div className="bg-muted p-3 rounded-lg text-sm">
                    <strong>Reason:</strong> {application.admin_notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <Store className="h-16 w-16 mx-auto text-primary mb-4" />
                <CardTitle>Apply to Become a Seller</CardTitle>
                <CardDescription>
                  {user
                    ? "Fill out the form below to apply"
                    : "Sign in to become a seller"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        placeholder="Your store or business name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+254..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessDescription">Business Description</Label>
                      <Textarea
                        id="businessDescription"
                        value={formData.businessDescription}
                        onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                        placeholder="Tell us about your products..."
                        rows={3}
                      />
                    </div>
                    <Button type="submit" disabled={applying} className="w-full">
                      {applying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Submit Application
                    </Button>
                  </form>
                ) : (
                  <Button size="lg" onClick={() => navigate("/auth")} className="w-full">
                    Sign In to Continue
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BecomeSeller;