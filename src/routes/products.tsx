import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Droplet, Search, Star } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products — RO Purifiers, Softeners & Spare Parts | Sujala" },
      { name: "description", content: "Browse RO water purifiers, commercial and industrial RO plants, water softeners, membranes and filters." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const cats = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const products = useQuery({
    queryKey: ["products", cat, q],
    queryFn: async () => {
      let query = supabase.from("products").select("*, categories(name, slug)").eq("is_active", true);
      if (cat) query = query.eq("category_id", cat);
      if (q) query = query.ilike("name", `%${q}%`);
      const { data, error } = await query.order("is_featured", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <SiteShell>
      <section className="border-b border-border bg-gradient-soft">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="text-xs font-bold uppercase tracking-widest text-primary">Our catalog</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">Water purifiers & spares</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Genuine products with warranty, installation and AMC options.</p>
          <div className="mt-6 max-w-md">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search RO purifiers, filters, membranes…" className="pl-9 h-11 bg-background" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="flex flex-wrap gap-2">
          <FilterPill active={!cat} onClick={() => setCat(null)}>All products</FilterPill>
          {cats.data?.map((c) => (
            <FilterPill key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>{c.name}</FilterPill>
          ))}
        </div>

        {products.isLoading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-secondary" />
            ))}
          </div>
        ) : products.data && products.data.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.data.map((p) => (
              <Link key={p.id} to="/products/$slug" params={{ slug: p.slug }} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-hover">
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-soft">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-primary/25">
                      <Droplet className="h-16 w-16" />
                    </div>
                  )}
                  {p.discount_price && p.discount_price < p.price && (
                    <div className="absolute left-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-destructive-foreground">
                      Save ₹{(p.price - p.discount_price).toLocaleString("en-IN")}
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{p.brand}</div>
                  <div className="mt-1 line-clamp-2 text-sm font-semibold">{p.name}</div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-warning">
                    <Star className="h-3.5 w-3.5 fill-warning" />
                    <span className="font-medium text-foreground">{p.rating ?? 4.5}</span>
                  </div>
                  <div className="mt-auto pt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-primary">₹{(p.discount_price ?? p.price).toLocaleString("en-IN")}</span>
                      {p.discount_price && p.discount_price < p.price && (
                        <span className="text-xs text-muted-foreground line-through">₹{p.price.toLocaleString("en-IN")}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-16 rounded-2xl border border-dashed border-border p-14 text-center">
            <div className="text-lg font-semibold">No products match</div>
            <p className="mt-1 text-sm text-muted-foreground">Try a different search or category.</p>
          </div>
        )}
      </section>
    </SiteShell>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-full border px-4 py-2 text-sm font-medium transition-all " +
        (active
          ? "border-primary bg-primary text-primary-foreground shadow-card"
          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}
