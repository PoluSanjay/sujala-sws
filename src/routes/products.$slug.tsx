import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Droplet, Loader2, ShieldCheck, ShoppingCart, Truck, Wrench } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { PRODUCT_BY_HANDLE_QUERY, formatPrice, storefrontApiRequest } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";

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
  const isLoading = useCartStore((s) => s.isLoading);
  const [variantIdx, setVariantIdx] = useState(0);

  const { data: product, isLoading: loadingProduct, isError } = useQuery({
    queryKey: ["shopify-product", slug],
    queryFn: async () => {
      const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle: slug });
      const p = data?.data?.productByHandle;
      if (!p) throw notFound();
      return p;
    },
  });

  if (loadingProduct) return <SiteShell><div className="mx-auto max-w-7xl px-4 py-16">Loading…</div></SiteShell>;
  if (isError || !product) return null;

  const variants = product.variants.edges.map((e: any) => e.node);
  const variant = variants[variantIdx] ?? variants[0];
  const img = product.images.edges[0]?.node;

  const productNode = { node: { ...product } };

  const handleAdd = async () => {
    if (!variant) return;
    await addItem({
      product: productNode as any,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Added to cart", { position: "top-right" });
  };

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
            {img ? (
              <img src={img.url} alt={img.altText ?? product.title} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-primary/25">
                <Droplet className="h-32 w-32" />
              </div>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{product.title}</h1>
          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-4xl font-bold text-primary">
              {formatPrice(variant.price.amount, variant.price.currencyCode)}
            </span>
            {!variant.availableForSale && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">Out of stock</span>
            )}
          </div>

          <p className="mt-6 whitespace-pre-line text-muted-foreground">{product.description}</p>

          {variants.length > 1 && (
            <div className="mt-6">
              <div className="text-sm font-medium">Options</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {variants.map((v: any, i: number) => (
                  <button
                    key={v.id}
                    onClick={() => setVariantIdx(i)}
                    className={
                      "rounded-full border px-4 py-2 text-sm font-medium transition-all " +
                      (i === variantIdx ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/40")
                    }
                  >
                    {v.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={handleAdd} disabled={isLoading || !variant?.availableForSale}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShoppingCart className="mr-1.5 h-4 w-4" /> Add to cart</>}
            </Button>
            <Button size="lg" variant="outline" asChild><Link to="/services">Book installation</Link></Button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-border bg-card p-4">
            <Perk icon={ShieldCheck} label="Warranty" />
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
