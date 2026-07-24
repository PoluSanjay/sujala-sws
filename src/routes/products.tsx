import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Droplet, Search, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCartStore, formatINR } from "@/stores/cartStore";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Shop — RO Purifiers, Softeners & Spares | Sujala" },
      { name: "description", content: "Buy RO water purifiers, softeners, membranes and filters online. Cash on Delivery or Bank Transfer. Free installation." },
      { property: "og:title", content: "Sujala Shop — Water Purifiers & Spares" },
      { property: "og:description", content: "Shop premium water purification products with Cash on Delivery or Bank Transfer." },
    ],
  }),
  component: ProductsPage,
});

type Row = {
  id: string; slug: string; name: string; brand: string | null;
  description: string | null; price: number; discount_price: number | null;
  image_url: string | null; stock: number;
};

function ProductsPage() {
  const [q, setQ] = useState("");
  const products = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, slug, name, brand, description, price, discount_price, image_url, stock")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const filtered = useMemo(() => {
    if (!products.data) return [];
    if (!q.trim()) return products.data;
    const needle = q.toLowerCase();
    return products.data.filter((p) =>
      p.name.toLowerCase().includes(needle) ||
      (p.description ?? "").toLowerCase().includes(needle) ||
      (p.brand ?? "").toLowerCase().includes(needle),
    );
  }, [products.data, q]);

  return (
    <SiteShell>
      <section className="border-b border-border bg-gradient-soft">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="text-xs font-bold uppercase tracking-widest text-primary">Our shop</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">Water purifiers & spares</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Genuine products with warranty and installation. Cash on Delivery or Bank Transfer.</p>
          <div className="mt-6 max-w-md">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="h-11 bg-background pl-9" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        {products.isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-secondary" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-14 text-center">
            <Droplet className="mx-auto h-10 w-10 text-primary/40" />
            <div className="mt-3 text-lg font-semibold">No products found</div>
            <p className="mt-1 text-sm text-muted-foreground">Try a different search, or ask an admin to add products.</p>
          </div>
        )}
      </section>
    </SiteShell>
  );
}

function ProductCard({ product }: { product: Row }) {
  const addItem = useCartStore((s) => s.addItem);
  const price = product.discount_price ?? product.price;
  const inStock = product.stock > 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      image: product.image_url,
      price: Number(price),
    });
    toast.success("Added to cart");
  };

  return (
    <Link to="/products/$slug" params={{ slug: product.slug }} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-hover">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-soft">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="grid h-full w-full place-items-center text-primary/25">
            <Droplet className="h-16 w-16" />
          </div>
        )}
        {product.discount_price && (
          <div className="absolute left-3 top-3 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive-foreground">Sale</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{product.brand}</div>
        <div className="line-clamp-2 text-sm font-semibold">{product.name}</div>
        {product.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{product.description}</p>}
        <div className="mt-auto flex items-center justify-between pt-3">
          <div>
            <div className="text-lg font-bold text-primary">{formatINR(Number(price))}</div>
            {product.discount_price && <div className="text-xs text-muted-foreground line-through">{formatINR(Number(product.price))}</div>}
          </div>
          <Button size="sm" onClick={handleAdd} disabled={!inStock}>
            <ShoppingCart className="mr-1.5 h-4 w-4" /> {inStock ? "Add" : "Out"}
          </Button>
        </div>
      </div>
    </Link>
  );
}
