import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SellerRegistrationForm from "@/components/seller/SellerRegistrationForm";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Store, CheckCircle, Clock, XCircle, ArrowRight } from "lucide-react";

const BecomeSeller = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<string | null>(null);
  const [isApprovedSeller, setIsApprovedSeller] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      checkSellerStatus();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const checkSellerStatus = async () => {
    if (!user) return;

    try {
      // Check if user is already an approved seller
      const { data: sellerProfile } = await supabase
        .from("seller_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (sellerProfile) {
        setIsApprovedSeller(true);
        setLoading(false);
        return;
      }

      // Check for pending/rejected application
      const { data: application } = await supabase
        .from("seller_applications")
        .select("status, admin_notes")
        .eq("user_id", user.id)
        .maybeSingle();

      if (application) {
        setApplicationStatus(application.status);
        setAdminNotes(application.admin_notes);
      }
    } catch (error) {
      console.error("Error checking seller status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationSuccess = () => {
    setApplicationStatus("pending");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // User is already an approved seller
  if (isApprovedSeller) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">You're Already a Seller!</CardTitle>
              <CardDescription>
                Your seller account is active. Start listing your products now.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate("/sell")} className="gap-2">
                Go to Seller Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // User has a pending application
  if (applicationStatus === "pending") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <Badge variant="secondary" className="mx-auto mb-4">Application Pending</Badge>
              <CardTitle className="text-2xl">Your Application is Under Review</CardTitle>
              <CardDescription>
                Thank you for applying to become a seller on Kenyashipment. Our team is reviewing your application and will get back to you soon.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              <p>This usually takes 1-2 business days. We'll notify you via email once a decision is made.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // User has a rejected application
  if (applicationStatus === "rejected") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <Badge variant="destructive" className="mx-auto mb-4">Application Declined</Badge>
              <CardTitle className="text-2xl">Application Not Approved</CardTitle>
              <CardDescription>
                Unfortunately, your seller application was not approved at this time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {adminNotes && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium mb-1">Reason:</p>
                  <p className="text-muted-foreground">{adminNotes}</p>
                </div>
              )}
              <p className="text-center text-muted-foreground text-sm">
                If you believe this was a mistake or have addressed the concerns, please contact our support team.
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // User not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Store className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Become a Seller on Kenyashipment</CardTitle>
              <CardDescription>
                Join our marketplace and reach thousands of customers across Kenya.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Please sign in or create an account to apply as a seller.
              </p>
              <Button onClick={() => navigate("/auth")} className="gap-2">
                Sign In to Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Show the application form
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Store className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Become a Seller</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Fill out the form below to apply as a seller on Kenyashipment. Our team will review your application and get back to you within 1-2 business days.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Seller Application</CardTitle>
              <CardDescription>
                Please provide accurate information. All fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SellerRegistrationForm onSuccess={handleApplicationSuccess} />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BecomeSeller;
