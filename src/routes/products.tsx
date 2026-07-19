import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Droplet, Loader2, Search, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PRODUCTS_QUERY, formatPrice, storefrontApiRequest, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Shop — RO Purifiers, Softeners & Spares | Sujala" },
      { name: "description", content: "Buy RO water purifiers, softeners, membranes and filters online. Secure checkout, warranty and installation included." },
      { property: "og:title", content: "Sujala Shop — Water Purifiers & Spares" },
      { property: "og:description", content: "Shop premium water purification products online with secure checkout." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const [q, setQ] = useState("");
  const products = useQuery({
    queryKey: ["shopify-products"],
    queryFn: async () => {
      const data = await storefrontApiRequest(PRODUCTS_QUERY, { first: 50, query: null });
      return (data?.data?.products?.edges ?? []) as ShopifyProduct[];
    },
  });

  const filtered = useMemo(() => {
    if (!products.data) return [];
    if (!q.trim()) return products.data;
    const needle = q.toLowerCase();
    return products.data.filter((p) => p.node.title.toLowerCase().includes(needle) || p.node.description.toLowerCase().includes(needle));
  }, [products.data, q]);

  return (
    <SiteShell>
      <section className="border-b border-border bg-gradient-soft">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="text-xs font-bold uppercase tracking-widest text-primary">Our shop</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">Water purifiers & spares</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Genuine products with warranty and installation. Order online for doorstep delivery.</p>
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
            {filtered.map((p) => <ProductCard key={p.node.id} product={p} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-14 text-center">
            <Droplet className="mx-auto h-10 w-10 text-primary/40" />
            <div className="mt-3 text-lg font-semibold">No products found</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Ask the team to add products, or tell us in chat what you'd like to sell (name and price).
            </p>
          </div>
        )}
      </section>
    </SiteShell>
  );
}

function ProductCard({ product }: { product: ShopifyProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const variant = product.node.variants.edges[0]?.node;
  const img = product.node.images.edges[0]?.node;
  const price = product.node.priceRange.minVariantPrice;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Added to cart", { position: "top-right" });
  };

  return (
    <Link to="/products/$slug" params={{ slug: product.node.handle }} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-hover">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-soft">
        {img ? (
          <img src={img.url} alt={img.altText ?? product.node.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="grid h-full w-full place-items-center text-primary/25">
            <Droplet className="h-16 w-16" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="line-clamp-2 text-sm font-semibold">{product.node.title}</div>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{product.node.description}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-bold text-primary">{formatPrice(price.amount, price.currencyCode)}</span>
          <Button size="sm" onClick={handleAdd} disabled={isLoading || !variant?.availableForSale}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShoppingCart className="mr-1.5 h-4 w-4" /> Add</>}
          </Button>
        </div>
      </div>
    </Link>
  );
}
