import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload, Image as ImageIcon } from "lucide-react";

// Slot specs match the design ratios used on the landing page.
// Tolerance: ±2% on aspect ratio.
export const LANDING_IMAGE_SLOTS = [
  { key: "hero_1", label: "Hero Slide 1", width: 1920, height: 1080, note: "16:9 widescreen hero" },
  { key: "hero_2", label: "Hero Slide 2", width: 1920, height: 1080, note: "16:9 widescreen hero" },
  { key: "hero_3", label: "Hero Slide 3", width: 1920, height: 1080, note: "16:9 widescreen hero" },
  { key: "routine_cta", label: "Routine CTA (left panel)", width: 800, height: 800, note: "Square 1:1" },
  { key: "brand_story", label: "Brand Story Background", width: 1920, height: 800, note: "Wide 12:5 banner" },
  { key: "treatment_dark_spots", label: "Treatment — Dark Spots", width: 600, height: 800, note: "Portrait 3:4" },
  { key: "treatment_acne", label: "Treatment — Acne", width: 600, height: 800, note: "Portrait 3:4" },
  { key: "treatment_dry_skin", label: "Treatment — Dry Skin", width: 600, height: 800, note: "Portrait 3:4" },
  { key: "treatment_oily_skin", label: "Treatment — Oily Skin", width: 600, height: 800, note: "Portrait 3:4" },
  { key: "treatment_wrinkles", label: "Treatment — Wrinkles", width: 600, height: 800, note: "Portrait 3:4" },
  { key: "treatment_uneven_tone", label: "Treatment — Uneven Tone", width: 600, height: 800, note: "Portrait 3:4" },
  { key: "treatment_sensitivity", label: "Treatment — Sensitivity", width: 600, height: 800, note: "Portrait 3:4" },
  { key: "treatment_sun_damage", label: "Treatment — Sun Damage", width: 600, height: 800, note: "Portrait 3:4" },
] as const;

type SlotKey = typeof LANDING_IMAGE_SLOTS[number]["key"];
type Spec = typeof LANDING_IMAGE_SLOTS[number];

const ASPECT_TOLERANCE = 0.02;
const MAX_FILE_BYTES = 8 * 1024 * 1024;

const validateImage = (file: File, spec: Spec): Promise<void> =>
  new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_BYTES) {
      reject(new Error(`File too large (max ${MAX_FILE_BYTES / 1024 / 1024}MB)`));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const expected = spec.width / spec.height;
      const actual = img.width / img.height;
      const diff = Math.abs(actual - expected) / expected;
      if (diff > ASPECT_TOLERANCE) {
        reject(
          new Error(
            `Image must be ${spec.width}×${spec.height} (or same ${expected.toFixed(2)}:1 ratio). Uploaded: ${img.width}×${img.height}.`
          )
        );
        return;
      }
      if (img.width < spec.width * 0.5) {
        reject(new Error(`Resolution too low. Minimum width: ${Math.round(spec.width * 0.5)}px.`));
        return;
      }
      resolve();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image file."));
    };
    img.src = url;
  });

const LandingImagesManager = () => {
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<SlotKey | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("landing_images").select("slot, image_url");
    if (error) toast.error("Failed to load images");
    else setImages(Object.fromEntries((data ?? []).map((r) => [r.slot, r.image_url])));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (spec: Spec, file: File) => {
    try {
      await validateImage(file, spec);
    } catch (e: any) {
      toast.error(e.message);
      return;
    }
    setUploading(spec.key as SlotKey);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${spec.key}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("landing-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("landing-images").getPublicUrl(path);
      const { data: { user } } = await supabase.auth.getUser();
      const { error: dbErr } = await supabase
        .from("landing_images")
        .upsert({ slot: spec.key, image_url: pub.publicUrl, updated_by: user?.id, updated_at: new Date().toISOString() });
      if (dbErr) throw dbErr;
      setImages((prev) => ({ ...prev, [spec.key]: pub.publicUrl }));
      toast.success(`${spec.label} updated`);
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Landing Page Images</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload images for each section of the home page. Dimensions must match the listed ratio so the layout stays clean.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {LANDING_IMAGE_SLOTS.map((spec) => {
          const current = images[spec.key];
          const isUploading = uploading === spec.key;
          return (
            <Card key={spec.key} className="p-3 flex gap-3 items-center">
              <div className="w-20 h-20 shrink-0 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                {current ? (
                  <a href={current} target="_blank" rel="noreferrer" title="Open full image">
                    <img src={current} alt={spec.label} className="w-full h-full object-cover" />
                  </a>
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <h3 className="font-medium text-sm truncate">{spec.label}</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {spec.width}×{spec.height} • {spec.note}
                  </p>
                </div>
                <label className="block">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={isUploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(spec, f);
                      e.target.value = "";
                    }}
                  />
                  <Button type="button" asChild variant="outline" size="sm" className="w-full" disabled={isUploading}>
                    <span className="cursor-pointer">
                      {isUploading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Upload className="h-3 w-3 mr-1" />}
                      {isUploading ? "Uploading..." : current ? "Replace" : "Upload"}
                    </span>
                  </Button>
                </label>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default LandingImagesManager;
