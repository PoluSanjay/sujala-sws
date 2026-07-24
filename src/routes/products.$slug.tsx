import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Droplet, ShieldCheck, ShoppingCart, Truck, Wrench, CheckCircle2, Zap } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCartStore, formatINR } from "@/stores/cartStore";

export const Route = createFileRoute("/products/$slug")({
  component: ProductDetail,
  notFoundComponent: () => (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl font-bold">Product not found</h1>
        <p className="mt-2 text-muted-foreground">This product may have been removed.</p>
        <Button asChild className="mt-6"><Link to="/products">Back to shop</Link></Button>
      </div>
    </SiteShell>
  ),
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const addItem = useCartStore((s) => s.addItem);
  const navigate = useNavigate();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  if (isLoading) return <SiteShell><div className="mx-auto max-w-7xl px-4 py-16">Loading…</div></SiteShell>;
  if (!product) return null;

  const price = Number(product.discount_price ?? product.price);
  const inStock = (product.stock ?? 0) > 0;
  const features = Array.isArray(product.features) ? (product.features as string[]) : [];

  const addToCart = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      image: product.image_url,
      price,
    });
  };

  const handleAdd = () => { addToCart(); toast.success("Added to cart"); };
  const handleBuyNow = () => { addToCart(); navigate({ to: "/checkout" }); };

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <Link to="/products" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>
      </div>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 md:grid-cols-2 md:px-6">
        <div className="overflow-hidden rounded-3xl border border-border bg-gradient-soft shadow-card">
          <div className="aspect-square">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-primary/25">
                <Droplet className="h-32 w-32" />
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{product.brand}</div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">{product.name}</h1>
          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-4xl font-bold text-primary">{formatINR(price)}</span>
            {product.discount_price && (
              <span className="text-lg text-muted-foreground line-through">{formatINR(Number(product.price))}</span>
            )}
            {!inStock && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">Out of stock</span>
            )}
          </div>

          {product.description && (
            <p className="mt-6 whitespace-pre-line text-muted-foreground">{product.description}</p>
          )}

          {features.length > 0 && (
            <ul className="mt-6 grid gap-2">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" /> {f}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={handleAdd} disabled={!inStock}>
              <ShoppingCart className="mr-1.5 h-4 w-4" /> Add to cart
            </Button>
            <Button size="lg" variant="outline" asChild><Link to="/services">Book installation</Link></Button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-border bg-card p-4">
            <Perk icon={ShieldCheck} label={product.warranty || "Warranty"} />
            <Perk icon={Truck} label="Free delivery" />
            <Perk icon={Wrench} label="Free install" />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function Perk({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <Icon className="h-5 w-5 text-primary" />
      <div className="text-[11px] font-medium">{label}</div>
    </div>
  );
}
