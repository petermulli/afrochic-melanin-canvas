import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, MapPin } from "lucide-react";
import { z } from "zod";

const sellerRegistrationSchema = z.object({
  shopName: z.string().trim().min(2, "Shop name must be at least 2 characters"),
  businessDescription: z.string().trim().min(10, "Please provide a brief description of your business"),
  nationalId: z.string().trim().min(6, "National ID must be at least 6 characters"),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().min(10, "Phone must be at least 10 characters"),
  addressLine: z.string().trim().min(5, "Address must be at least 5 characters"),
  city: z.string().trim().min(2, "City must be at least 2 characters"),
  mapLatitude: z.string().optional(),
  mapLongitude: z.string().optional(),
});

interface SellerRegistrationFormProps {
  onSuccess: () => void;
}

const SellerRegistrationForm = ({ onSuccess }: SellerRegistrationFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    shopName: "",
    businessDescription: "",
    nationalId: "",
    email: user?.email || "",
    phone: "",
    addressLine: "",
    city: "",
    mapLatitude: "",
    mapLongitude: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!user) {
      toast.error("You must be logged in to apply as a seller");
      return;
    }

    // Validate form data
    try {
      sellerRegistrationSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setLoading(true);

    try {
      // Build map coordinates if provided
      const mapCoordinates = formData.mapLatitude && formData.mapLongitude
        ? { lat: parseFloat(formData.mapLatitude), lng: parseFloat(formData.mapLongitude) }
        : null;

      const { error } = await supabase.from("seller_applications").insert({
        user_id: user.id,
        shop_name: formData.shopName.trim(),
        business_name: formData.shopName.trim(), // Keep for backwards compatibility
        business_description: formData.businessDescription.trim(),
        national_id: formData.nationalId.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address_line: formData.addressLine.trim(),
        city: formData.city.trim(),
        map_coordinates: mapCoordinates,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Seller application submitted successfully! We'll review it and get back to you soon.");
      onSuccess();
    } catch (error: any) {
      console.error("Error submitting seller application:", error);
      if (error.code === "23505") {
        toast.error("You have already submitted a seller application");
      } else {
        toast.error("Failed to submit application. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Shop Name */}
        <div className="space-y-2">
          <Label htmlFor="shopName">Shop Name *</Label>
          <Input
            id="shopName"
            value={formData.shopName}
            onChange={(e) => handleChange("shopName", e.target.value)}
            placeholder="Your shop/business name"
            className={errors.shopName ? "border-destructive" : ""}
          />
          {errors.shopName && (
            <p className="text-sm text-destructive">{errors.shopName}</p>
          )}
        </div>

        {/* National ID */}
        <div className="space-y-2">
          <Label htmlFor="nationalId">National ID *</Label>
          <Input
            id="nationalId"
            value={formData.nationalId}
            onChange={(e) => handleChange("nationalId", e.target.value)}
            placeholder="Your national ID number"
            className={errors.nationalId ? "border-destructive" : ""}
          />
          {errors.nationalId && (
            <p className="text-sm text-destructive">{errors.nationalId}</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="your@email.com"
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+254..."
            className={errors.phone ? "border-destructive" : ""}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Business Description */}
      <div className="space-y-2">
        <Label htmlFor="businessDescription">Business Description *</Label>
        <Textarea
          id="businessDescription"
          value={formData.businessDescription}
          onChange={(e) => handleChange("businessDescription", e.target.value)}
          placeholder="Tell us about your business, what products you sell, and your experience..."
          rows={3}
          className={errors.businessDescription ? "border-destructive" : ""}
        />
        {errors.businessDescription && (
          <p className="text-sm text-destructive">{errors.businessDescription}</p>
        )}
      </div>

      <div className="border-t pt-6">
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Physical Shop Location
        </h3>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Address Line */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="addressLine">Address *</Label>
            <Input
              id="addressLine"
              value={formData.addressLine}
              onChange={(e) => handleChange("addressLine", e.target.value)}
              placeholder="Street address, building, floor..."
              className={errors.addressLine ? "border-destructive" : ""}
            />
            {errors.addressLine && (
              <p className="text-sm text-destructive">{errors.addressLine}</p>
            )}
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">City / Town *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="e.g., Nairobi, Mombasa"
              className={errors.city ? "border-destructive" : ""}
            />
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city}</p>
            )}
          </div>
        </div>

        {/* Map Coordinates (Optional) */}
        <div className="mt-4">
          <Label className="text-muted-foreground">
            Map Coordinates (Optional - for shop location on map)
          </Label>
          <div className="grid gap-4 md:grid-cols-2 mt-2">
            <div className="space-y-2">
              <Label htmlFor="mapLatitude" className="text-sm text-muted-foreground">Latitude</Label>
              <Input
                id="mapLatitude"
                type="number"
                step="any"
                value={formData.mapLatitude}
                onChange={(e) => handleChange("mapLatitude", e.target.value)}
                placeholder="e.g., -1.2921"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mapLongitude" className="text-sm text-muted-foreground">Longitude</Label>
              <Input
                id="mapLongitude"
                type="number"
                step="any"
                value={formData.mapLongitude}
                onChange={(e) => handleChange("mapLongitude", e.target.value)}
                placeholder="e.g., 36.8219"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            You can get these from Google Maps by right-clicking on your location
          </p>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Seller Application"
        )}
      </Button>
    </form>
  );
};

export default SellerRegistrationForm;
