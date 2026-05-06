import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Upload, Image as ImageIcon, Trash2, Plus } from "lucide-react";

interface Treatment {
  id: string;
  label: string;
  query: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

const MAX_BYTES = 8 * 1024 * 1024;

const TreatmentsManager = () => {
  const [items, setItems] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("treatments")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) toast.error("Failed to load treatments");
    else setItems(data as Treatment[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateField = (id: string, patch: Partial<Treatment>) => {
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const save = async (t: Treatment) => {
    const { error } = await supabase
      .from("treatments")
      .update({
        label: t.label,
        query: t.query,
        sort_order: t.sort_order,
        is_active: t.is_active,
      })
      .eq("id", t.id);
    if (error) toast.error(error.message);
    else toast.success("Saved");
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this treatment tile?")) return;
    const { error } = await supabase.from("treatments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setItems((prev) => prev.filter((t) => t.id !== id));
    toast.success("Deleted");
  };

  const addNew = async () => {
    const sort = items.length ? Math.max(...items.map((i) => i.sort_order)) + 1 : 1;
    const { data, error } = await supabase
      .from("treatments")
      .insert({ label: "New Treatment", query: "new", sort_order: sort })
      .select()
      .single();
    if (error) return toast.error(error.message);
    setItems((prev) => [...prev, data as Treatment]);
  };

  const handleUpload = async (t: Treatment, file: File) => {
    if (file.size > MAX_BYTES) return toast.error("Max 8MB");
    setUploadingId(t.id);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `treatment-${t.id}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("landing-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("landing-images").getPublicUrl(path);
      const { error: dbErr } = await supabase
        .from("treatments")
        .update({ image_url: pub.publicUrl })
        .eq("id", t.id);
      if (dbErr) throw dbErr;
      updateField(t.id, { image_url: pub.publicUrl });
      toast.success("Image updated");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Shop by Treatment</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the 4 treatment tiles on the landing page. Recommended image size 600×800 (Portrait 3:4).
          </p>
        </div>
        <Button onClick={addNew} variant="outline">
          <Plus className="h-4 w-4 mr-2" /> Add Tile
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((t) => {
          const isUploading = uploadingId === t.id;
          return (
            <Card key={t.id} className="p-4 space-y-3">
              <div className="flex gap-3">
                <div className="w-20 h-24 shrink-0 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                  {t.image_url ? (
                    <a href={t.image_url} target="_blank" rel="noreferrer">
                      <img src={t.image_url} alt={t.label} className="w-full h-full object-cover" />
                    </a>
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1 text-xs text-muted-foreground self-center">
                  Recommended 600×800 (3:4)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <Label>Label</Label>
                  <Input value={t.label} onChange={(e) => updateField(t.id, { label: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label>Search Query (used in /products?treatment=)</Label>
                  <Input value={t.query} onChange={(e) => updateField(t.id, { query: e.target.value })} />
                </div>
                <div>
                  <Label>Order</Label>
                  <Input
                    type="number"
                    value={t.sort_order}
                    onChange={(e) => updateField(t.id, { sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Switch checked={t.is_active} onCheckedChange={(v) => updateField(t.id, { is_active: v })} />
                  <span className="text-sm">{t.is_active ? "Active" : "Hidden"}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={isUploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(t, f);
                      e.target.value = "";
                    }}
                  />
                  <Button type="button" asChild variant="outline" className="w-full" disabled={isUploading}>
                    <span className="cursor-pointer">
                      {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                      {isUploading ? "Uploading..." : "Image"}
                    </span>
                  </Button>
                </label>
                <Button onClick={() => save(t)}>Save</Button>
                <Button variant="destructive" size="icon" onClick={() => remove(t.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TreatmentsManager;
