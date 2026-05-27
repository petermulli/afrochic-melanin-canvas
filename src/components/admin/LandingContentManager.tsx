import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { LANDING_CONTENT_SLOTS } from "@/lib/landingContentSchema";
import { LANDING_ICON_KEYS, LANDING_ICON_MAP } from "@/lib/landingIcons";

const LandingContentManager = () => {
  const [content, setContent] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const [savingSlot, setSavingSlot] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("landing_content").select("slot, content");
    if (error) toast.error("Failed to load content");
    else {
      const map: Record<string, Record<string, string>> = {};
      for (const s of LANDING_CONTENT_SLOTS) {
        const row = (data ?? []).find((r: any) => r.slot === s.slot);
        map[s.slot] = {};
        for (const f of s.fields) {
          map[s.slot][f.key] = (row?.content as any)?.[f.key] ?? f.default;
        }
      }
      setContent(map);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const update = (slot: string, key: string, value: string) => {
    setContent((p) => ({ ...p, [slot]: { ...p[slot], [key]: value } }));
  };

  const save = async (slot: string) => {
    setSavingSlot(slot);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("landing_content")
      .upsert({ slot, content: content[slot], updated_by: user?.id, updated_at: new Date().toISOString() });
    setSavingSlot(null);
    if (error) toast.error(error.message);
    else toast.success("Saved");
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Landing Page Text</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Edit headings, subtexts, button labels and links across every section of the home page.
        </p>
      </div>
      <Accordion type="multiple" className="space-y-2">
        {LANDING_CONTENT_SLOTS.map((s) => (
          <AccordionItem key={s.slot} value={s.slot} className="border rounded-md px-4">
            <AccordionTrigger className="hover:no-underline">
              <span className="font-medium">{s.title}</span>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-4 space-y-3 border-0 shadow-none">
                {s.fields.map((f) => (
                  <div key={f.key}>
                    <Label>{f.label}</Label>
                    {f.type === "textarea" ? (
                      <Textarea
                        rows={3}
                        value={content[s.slot]?.[f.key] ?? ""}
                        onChange={(e) => update(s.slot, f.key, e.target.value)}
                      />
                    ) : f.type === "icon" ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5 p-2 border rounded-md max-h-48 overflow-y-auto">
                          {LANDING_ICON_KEYS.map((k) => {
                            const Icon = LANDING_ICON_MAP[k];
                            const selected = (content[s.slot]?.[f.key] ?? "") === k;
                            return (
                              <button
                                key={k}
                                type="button"
                                onClick={() => update(s.slot, f.key, k)}
                                title={k}
                                className={`aspect-square rounded-md flex items-center justify-center border transition ${selected ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-transparent hover:bg-muted"}`}
                              >
                                <Icon className="h-4 w-4" />
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-[11px] text-muted-foreground">Selected: <span className="font-mono">{content[s.slot]?.[f.key] || "—"}</span></p>
                      </div>
                    ) : (
                      <Input
                        value={content[s.slot]?.[f.key] ?? ""}
                        onChange={(e) => update(s.slot, f.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
                <Button onClick={() => save(s.slot)} disabled={savingSlot === s.slot}>
                  {savingSlot === s.slot ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save {s.title}
                </Button>
              </Card>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default LandingContentManager;
