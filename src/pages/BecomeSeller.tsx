import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Store, Package, TrendingUp, CheckCircle } from "lucide-react";

const BecomeSeller = () => {
  const { user } = useAuth();
  const { isSeller, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    if (!user) {
      toast.error("Please sign in first");
      navigate("/auth");
      return;
    }

    setApplying(true);
    try {
      // Add seller role to user
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          role: "seller",
        });

      if (error) {
        if (error.code === "23505") {
          // Unique violation - user already has this role
          toast.info("You are already a seller!");
          navigate("/seller");
        } else {
          throw error;
        }
      } else {
        toast.success("Congratulations! You are now a seller.");
        navigate("/seller");
      }
    } catch (error: any) {
      console.error("Error applying as seller:", error);
      toast.error("Failed to apply. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  if (roleLoading) {
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

          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <CardTitle>Ready to Start?</CardTitle>
              <CardDescription>
                {user
                  ? "Click below to become a seller and start listing your products"
                  : "Sign in to become a seller"}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {user ? (
                <Button
                  size="lg"
                  onClick={handleApply}
                  disabled={applying}
                  className="w-full"
                >
                  {applying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Become a Seller
                </Button>
              ) : (
                <Button size="lg" onClick={() => navigate("/auth")} className="w-full">
                  Sign In to Continue
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BecomeSeller;
