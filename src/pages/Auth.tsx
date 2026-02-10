import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().min(10, "Phone must be at least 10 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const PasswordInput = ({
  id,
  name,
  label,
  error,
  placeholder,
  required = true,
}: {
  id: string;
  name: string;
  label: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
}) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          placeholder={placeholder}
          className={`pr-10 ${error ? "border-destructive" : ""}`}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signUp, signIn, resetPassword } = useAuth();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    if (user && !showNewPassword) {
      navigate("/");
    }
  }, [user, navigate, showNewPassword]);

  // Handle password reset callback
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "reset") {
      // User arrived via reset link — show new password form
      setShowNewPassword(true);
    }
  }, [searchParams]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    try {
      signUpSchema.parse(data);
      const { error } = await signUp(data.email, data.password, data.fullName, data.phone);
      if (!error) {
        navigate("/");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      signInSchema.parse(data);
      const { error } = await signIn(data.email, data.password);
      if (!error) {
        navigate("/");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    await resetPassword(resetEmail.trim());
    setResetLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const pw = formData.get("newPassword") as string;
    const pwConfirm = formData.get("confirmNewPassword") as string;
    if (pw.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (pw !== pwConfirm) {
      toast.error("Passwords do not match");
      return;
    }
    setUpdateLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setUpdateLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      setShowNewPassword(false);
      navigate("/");
    }
  };

  // New password form (after clicking reset link)
  if (showNewPassword) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="bg-card rounded-2xl p-8 shadow-soft animate-fade-in-up">
              <h1 className="text-2xl font-semibold tracking-tight mb-2 text-center">Set New Password</h1>
              <p className="text-sm text-muted-foreground text-center mb-6">Enter your new password below.</p>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <PasswordInput id="new-pw" name="newPassword" label="New Password" />
                <PasswordInput id="confirm-new-pw" name="confirmNewPassword" label="Confirm New Password" />
                <Button type="submit" size="lg" className="w-full rounded-full mt-2" disabled={updateLoading}>
                  {updateLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Forgot password form
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="bg-card rounded-2xl p-8 shadow-soft animate-fade-in-up">
              <button
                onClick={() => setShowForgotPassword(false)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Sign In
              </button>
              <h1 className="text-2xl font-semibold tracking-tight mb-2">Reset Password</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Enter the email you registered with. We'll send you a reset link.
              </p>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full rounded-full" disabled={resetLoading}>
                  {resetLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl p-8 shadow-soft animate-fade-in-up">
            <h1 className="text-3xl font-light tracking-tight mb-6 text-center">
              Welcome to Kenyashipment
            </h1>

            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as "signin" | "signup"); setErrors({}); }}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      required
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  <PasswordInput id="signin-password" name="password" label="Password" error={errors.password} />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Button type="submit" size="lg" className="w-full rounded-full">
                    Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input id="signup-name" name="fullName" required className={errors.fullName ? "border-destructive" : ""} />
                    {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" name="email" type="email" required className={errors.email ? "border-destructive" : ""} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <Input id="signup-phone" name="phone" type="tel" placeholder="+254" required className={errors.phone ? "border-destructive" : ""} />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                  </div>
                  <PasswordInput id="signup-password" name="password" label="Password" error={errors.password} />
                  <PasswordInput id="signup-confirm" name="confirmPassword" label="Confirm Password" error={errors.confirmPassword} />
                  <Button type="submit" size="lg" className="w-full mt-6 rounded-full">
                    Create Account
                  </Button>

                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="text-center space-y-3">
                      <p className="text-sm text-muted-foreground">Want to sell on Kenyashipment?</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => navigate("/become-seller")}
                        className="w-full rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        <Store className="h-4 w-4 mr-2" />
                        Open a Shop
                      </Button>
                    </div>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;
