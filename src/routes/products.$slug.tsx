import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Droplet, ShieldCheck, Star, Truck, Wrench } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/products/$slug")({
  component: ProductDetail,
  notFoundComponent: () => (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl font-bold">Product not found</h1>
        <p className="mt-2 text-muted-foreground">This product may have been removed.</p>
        <Button asChild className="mt-6"><Link to="/products">Back to products</Link></Button>
      </div>
    </SiteShell>
  ),
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*, categories(name, slug)").eq("slug", slug).eq("is_active", true).maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  if (isLoading) return <SiteShell><div className="mx-auto max-w-7xl px-4 py-16">Loading…</div></SiteShell>;
  if (isError || !product) return null;

  const features = Array.isArray(product.features) ? (product.features as string[]) : [];
  const specs = (product.specs ?? {}) as Record<string, string>;
  const finalPrice = product.discount_price ?? product.price;

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <Link to="/products" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to products
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
          <div className="text-xs font-bold uppercase tracking-widest text-primary">{product.brand}</div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 text-warning">
              <Star className="h-4 w-4 fill-warning" />
              <span className="font-semibold text-foreground">{product.rating ?? 4.5}</span>
            </span>
            <span className="text-muted-foreground">• {product.stock > 0 ? "In stock" : "Out of stock"}</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-4xl font-bold text-primary">₹{finalPrice.toLocaleString("en-IN")}</span>
            {product.discount_price && product.discount_price < product.price && (
              <>
                <span className="text-lg text-muted-foreground line-through">₹{product.price.toLocaleString("en-IN")}</span>
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-bold text-success">
                  Save ₹{(product.price - product.discount_price).toLocaleString("en-IN")}
                </span>
              </>
            )}
          </div>

          <p className="mt-6 text-muted-foreground">{product.description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild><Link to="/contact">Enquire now</Link></Button>
            <Button size="lg" variant="outline" asChild><Link to="/services">Book installation</Link></Button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-border bg-card p-4">
            <Perk icon={ShieldCheck} label={product.warranty ?? "1 Year Warranty"} />
            <Perk icon={Truck} label="Free delivery" />
            <Perk icon={Wrench} label="Free install" />
          </div>

          {features.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold">Key features</h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Object.keys(specs).length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold">Specifications</h3>
              <dl className="mt-3 divide-y divide-border rounded-xl border border-border">
                {Object.entries(specs).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-2 gap-4 px-4 py-3 text-sm">
                    <dt className="capitalize text-muted-foreground">{k.replace(/_/g, " ")}</dt>
                    <dd className="font-medium">{v as string}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
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
