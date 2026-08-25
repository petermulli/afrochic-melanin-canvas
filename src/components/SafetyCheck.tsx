import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  MapPin,
  ArrowRight,
  X,
  Leaf,
} from "lucide-react";

interface ApprovedProduct {
  id: string;
  name: string;
  description: string | null;
  ingredients: string[] | null;
  skin_types: string[] | null;
  treats: string[] | null;
  image_url: string | null;
}

interface Listing {
  id: string;
  name: string;
  price: number;
  images: string[];
  brand: string | null;
  location: string | null;
}

const SUGGESTIONS = ["Niacinamide serum", "Shea butter", "SPF 50", "Retinol", "Vitamin C"];

const SafetyCheck = () => {
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState<ApprovedProduct[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const t = setTimeout(() => setQuery(term.trim()), 350);
    return () => clearTimeout(t);
  }, [term]);

  useEffect(() => {
    if (query.length < 2) {
      setApproved([]);
      setListings([]);
      return;
    }
    let active = true;
    setLoading(true);
    const run = async () => {
      const safe = query.replace(/[%,()]/g, " ");
      const [a, p] = await Promise.all([
        supabase
          .from("approved_products")
          .select("id, name, description, ingredients, skin_types, treats, image_url")
          .or(`name.ilike.%${safe}%,description.ilike.%${safe}%`)
          .limit(4),
        supabase
          .from("products")
          .select("id, name, price, images, brand, location")
          .eq("status", "approved")
          .or(`name.ilike.%${safe}%,brand.ilike.%${safe}%,description.ilike.%${safe}%`)
          .limit(6),
      ]);
      if (!active) return;
      setApproved((a.data as ApprovedProduct[]) || []);
      setListings((p.data as Listing[]) || []);
      setLoading(false);
    };
    run();
    return () => {
      active = false;
    };
  }, [query]);

  const hasQuery = query.length >= 2;
  const verdictSafe = approved.length > 0;
  const primary = approved[0];

  const chips = useMemo(
    () => ({
      skin: primary?.skin_types ?? [],
      treats: primary?.treats ?? [],
      ingredients: primary?.ingredients ?? [],
    }),
    [primary]
  );

  return (
    <section className="relative z-20 -mt-16 md:-mt-24 px-4 sm:px-6 lg:px-8 pb-16">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-3xl border border-border bg-background/90 backdrop-blur-xl shadow-2xl p-6 sm:p-8"
        >
          <div className="text-center space-y-2 mb-6">
            <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-accent font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              Product Safety Check
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.03em]">
              Is this product safe for your skin?
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Search any product or ingredient. We check it against our dermatologist-approved
              register — then show you exactly where to get it.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="e.g. niacinamide serum, shea butter, SPF 50"
              aria-label="Search a product to check if it is safe for your skin"
              className="h-14 pl-14 pr-12 text-base rounded-full border-2 border-border focus-visible:border-primary bg-background"
            />
            {term && (
              <button
                onClick={() => setTerm("")}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {!hasQuery && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="text-xs text-muted-foreground">Try:</span>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setTerm(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {hasQuery && (
              <motion.div
                key={loading ? "loading" : verdictSafe ? "safe" : "unknown"}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="mt-6 space-y-5"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking our approved register…
                  </div>
                ) : (
                  <>
                    {/* Verdict */}
                    <div
                      className={`rounded-2xl p-5 border ${
                        verdictSafe
                          ? "border-accent/30 bg-accent/5"
                          : "border-amber/40 bg-amber/5"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {verdictSafe ? (
                          <ShieldCheck className="h-7 w-7 text-accent flex-shrink-0" />
                        ) : (
                          <ShieldAlert className="h-7 w-7 text-amber flex-shrink-0" />
                        )}
                        <div className="min-w-0 space-y-2">
                          <p className="font-display text-lg font-semibold tracking-[-0.02em]">
                            {verdictSafe
                              ? `${primary?.name} is approved for melanin-rich skin`
                              : `We haven't verified "${query}" yet`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {verdictSafe
                              ? primary?.description ||
                                "Reviewed for quality, safety and effectiveness by our skin experts."
                              : "It isn't in our approved register. Browse verified alternatives below or ask our community before you buy."}
                          </p>

                          {verdictSafe && chips.skin.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              <span className="text-xs text-muted-foreground mr-1">Best for:</span>
                              {chips.skin.map((s) => (
                                <Badge key={s} variant="outline" className="text-xs rounded-full">
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {verdictSafe && chips.treats.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              <span className="text-xs text-muted-foreground mr-1">Treats:</span>
                              {chips.treats.map((s) => (
                                <Badge key={s} variant="secondary" className="text-xs rounded-full">
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {verdictSafe && chips.ingredients.length > 0 && (
                            <p className="flex items-start gap-1.5 text-xs text-muted-foreground pt-1">
                              <Leaf className="h-3.5 w-3.5 text-accent mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-2">
                                <span className="font-medium text-foreground">Key ingredients: </span>
                                {chips.ingredients.join(", ")}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Other approved matches */}
                    {approved.length > 1 && (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-muted-foreground w-full">
                          Other approved matches
                        </span>
                        {approved.slice(1).map((a) => (
                          <span
                            key={a.id}
                            className="text-xs px-3 py-1.5 rounded-full bg-muted text-foreground"
                          >
                            {a.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Where to buy */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.18em]">
                          {verdictSafe ? "Where to get it" : "Verified alternatives"}
                        </h3>
                        <Link
                          to={`/products?search=${encodeURIComponent(query)}`}
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                        >
                          See all <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>

                      {listings.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border p-6 text-center space-y-3">
                          <p className="text-sm text-muted-foreground">
                            No shop is listing this right now.
                          </p>
                          <Button asChild variant="outline" className="rounded-full">
                            <Link to="/products">Browse the full catalogue</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="grid sm:grid-cols-2 gap-3">
                          {listings.map((l) => (
                            <Link
                              key={l.id}
                              to={`/product/${l.id}`}
                              className="group flex items-center gap-3 rounded-2xl border border-border p-3 hover:border-primary hover:shadow-md transition-all"
                            >
                              <div className="h-16 w-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                                {l.images?.[0] && (
                                  <img
                                    src={l.images[0]}
                                    alt={l.name}
                                    loading="lazy"
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                                  {l.name}
                                </p>
                                {l.brand && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {l.brand}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm font-semibold text-primary">
                                    {formatPrice(l.price)}
                                  </span>
                                  {l.location && (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                      <MapPin className="h-3 w-3" />
                                      {l.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default SafetyCheck;
