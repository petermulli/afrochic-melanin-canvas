import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search, Camera, Loader2, X, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HeroSearchProps {
  onSearch: (term: string) => void;
}

const SUGGESTIONS = ["Niacinamide serum", "Shea butter", "SPF 50", "Retinol"];

const HeroSearch = ({ onSearch }: HeroSearchProps) => {
  const [term, setTerm] = useState("");
  const [scanning, setScanning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = (value: string) => {
    const v = value.trim();
    if (v.length < 2) return;
    onSearch(v);
  };

  const handleImage = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please use an image under 5MB");
      return;
    }
    setScanning(true);
    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const { data, error } = await supabase.functions.invoke("identify-product-image", {
        body: { image: dataUrl },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const query = (data?.query as string) || "";
      if (!query) {
        toast.error("We couldn't recognise that product. Try typing its name.");
        return;
      }
      setTerm(query);
      submit(query);
      toast.success(`Identified: ${query}`);
    } catch (e: any) {
      toast.error(e?.message || "Image search failed. Try typing the product name.");
    } finally {
      setScanning(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="w-full max-w-xl"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(term);
        }}
        className="relative"
      >
        <div className="flex items-center gap-2 rounded-full bg-background/95 backdrop-blur-xl border-2 border-primary/40 shadow-elevated pl-4 sm:pl-5 pr-1.5 sm:pr-2 h-14 sm:h-16 transition-all focus-within:border-primary focus-within:bg-background focus-within:shadow-elevated">
          <Search className="h-5 w-5 text-accent flex-shrink-0" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search a product to check if it's safe for your skin"
            aria-label="Search a product to check if it is safe for your skin"
            className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm sm:text-base text-foreground placeholder:text-muted-foreground"
          />
          {term && (
            <button
              type="button"
              onClick={() => setTerm("")}
              aria-label="Clear search"
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <span className="h-7 w-px bg-border" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Search by image"
            title="Search by image"
            className="p-2 rounded-full text-accent hover:bg-muted transition-colors"
          >
            {scanning ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
          </button>
          <button
            type="submit"
            aria-label="Check product"
            className="inline-flex items-center justify-center h-10 w-10 sm:w-auto sm:px-5 rounded-full bg-primary text-primary-foreground text-xs uppercase tracking-widest font-black hover:bg-rust transition-colors"
          >
            <span className="hidden sm:inline">Check</span>
            <ArrowRight className="h-4 w-4 sm:hidden" />
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImage(f);
          }}
        />
      </form>

      <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setTerm(s);
              submit(s);
            }}
            className="text-[11px] sm:text-xs px-3 py-1.5 rounded-full bg-deep-red/70 backdrop-blur-md border border-background/40 text-background hover:bg-accent transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default HeroSearch;
