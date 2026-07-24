import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ImagePlus, Loader2, Pencil, Plus, ShieldOff, Trash2, X } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  adminCreateProduct,
  adminDeleteProduct,
  adminListProducts,
  adminUpdateProduct,
} from "@/lib/shopify-admin.functions";

export const Route = createFileRoute("/_authenticated/admin/products")({
  head: () => ({ meta: [{ title: "Manage Products | Sujala Admin" }] }),
  component: AdminProductsGate,
});

function AdminProductsGate() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) { setIsAdmin(false); return; }
      const { data } = await supabase.from("user_roles").select("role")
        .eq("user_id", userRes.user.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!data);
    })();
  }, []);
  if (isAdmin === null) return <SiteShell><div className="mx-auto max-w-7xl px-4 py-16">Checking permissions…</div></SiteShell>;
  if (!isAdmin) return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-destructive/10">
          <ShieldOff className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="mt-6 text-3xl font-bold">Admins only</h1>
        <Button asChild className="mt-6"><Link to="/dashboard">Back to dashboard</Link></Button>
      </div>
    </SiteShell>
  );
  return <AdminProducts />;
}

type Product = any;

function AdminProducts() {
  const qc = useQueryClient();
  const list = useServerFn(adminListProducts);
  const create = useServerFn(adminCreateProduct);
  const update = useServerFn(adminUpdateProduct);
  const del = useServerFn(adminDeleteProduct);

  const products = useQuery({ queryKey: ["admin-shopify-products"], queryFn: () => list() });

  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const delMut = useMutation({
    mutationFn: (id: number) => del({ data: { id } }),
    onSuccess: () => { toast.success("Product deleted"); qc.invalidateQueries({ queryKey: ["admin-shopify-products"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <SiteShell>
      <section className="border-b border-border bg-gradient-soft">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-10 md:px-6">
          <div>
            <Link to="/admin" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to admin
            </Link>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Products</h1>
            <p className="text-sm text-muted-foreground">Add, edit, price, and manage images. Synced live to Shopify.</p>
          </div>
          <Button onClick={() => setCreating(true)}><Plus className="mr-1.5 h-4 w-4" /> Add product</Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        {products.isLoading && <div className="text-muted-foreground">Loading products…</div>}
        {products.isError && <div className="text-destructive">{(products.error as any)?.message}</div>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.data?.map((p: Product) => {
            const img = p.image?.src || p.images?.[0]?.src;
            const v = p.variants?.[0];
            return (
              <div key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                <div className="aspect-square bg-secondary/40">
                  {img ? <img src={img} alt={p.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-muted-foreground">No image</div>}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold">{p.title}</div>
                      <div className="text-xs text-muted-foreground">{p.vendor} • {p.status}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">₹{v?.price}</div>
                      {v?.compare_at_price && <div className="text-xs text-muted-foreground line-through">₹{v.compare_at_price}</div>}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditing(p)}>
                      <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive"
                      onClick={() => confirm(`Delete "${p.title}"?`) && delMut.mutate(p.id)}
                      disabled={delMut.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {products.data?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground">
            No products yet. Click "Add product" to create your first one.
          </div>
        )}
      </section>

      {creating && (
        <ProductForm
          onClose={() => setCreating(false)}
          onSubmit={async (payload) => {
            await create({ data: payload as any });
            toast.success("Product created");
            qc.invalidateQueries({ queryKey: ["admin-shopify-products"] });
            setCreating(false);
          }}
        />
      )}
      {editing && (
        <ProductForm
          product={editing}
          onClose={() => setEditing(null)}
          onSubmit={async (payload, images, replace) => {
            const v = editing.variants?.[0];
            await update({ data: {
              id: editing.id,
              title: payload.title,
              body_html: payload.body_html,
              vendor: payload.vendor,
              product_type: payload.product_type,
              variantId: v?.id,
              price: payload.price,
              compare_at_price: payload.compare_at_price,
              images,
              replaceImages: replace,
            } as any });
            toast.success("Product updated");
            qc.invalidateQueries({ queryKey: ["admin-shopify-products"] });
            setEditing(null);
          }}
        />
      )}
    </SiteShell>
  );
}

function ProductForm({
  product, onClose, onSubmit,
}: {
  product?: any;
  onClose: () => void;
  onSubmit: (payload: any, images?: any[], replace?: boolean) => Promise<void>;
}) {
  const v = product?.variants?.[0];
  const [title, setTitle] = useState(product?.title ?? "");
  const [body_html, setBody] = useState(product?.body_html ?? "");
  const [vendor, setVendor] = useState(product?.vendor ?? "Sujala");
  const [product_type, setType] = useState(product?.product_type ?? "");
  const [price, setPrice] = useState(v?.price ?? "");
  const [compare_at_price, setCompare] = useState(v?.compare_at_price ?? "");
  const [sku, setSku] = useState(v?.sku ?? "");
  const [inventory_quantity, setQty] = useState<number>(10);
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<Array<{ src?: string; attachment?: string; filename?: string; preview: string }>>([]);
  const [replace, setReplace] = useState(false);
  const [saving, setSaving] = useState(false);

  const onFile = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const attachment = dataUrl.split(",")[1];
        setImages((prev) => [...prev, { attachment, filename: f.name, preview: dataUrl }]);
      };
      reader.readAsDataURL(f);
    });
  };

  const addUrl = () => {
    if (!imageUrl.trim()) return;
    setImages((prev) => [...prev, { src: imageUrl.trim(), preview: imageUrl.trim() }]);
    setImageUrl("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price.trim()) { toast.error("Title and price are required"); return; }
    setSaving(true);
    try {
      const imgs = images.map(({ preview, ...rest }) => rest);
      await onSubmit(
        { title, body_html, vendor, product_type, price, compare_at_price, sku, inventory_quantity },
        imgs.length ? imgs : undefined,
        replace,
      );
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-background p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{product ? "Edit product" : "Add product"}</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 hover:bg-secondary"><X className="h-5 w-5" /></button>
        </div>

        <div className="grid gap-4">
          <div>
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={body_html} onChange={(e) => setBody(e.target.value)} rows={4} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Vendor</Label><Input value={vendor} onChange={(e) => setVendor(e.target.value)} /></div>
            <div><Label>Type</Label><Input value={product_type} onChange={(e) => setType(e.target.value)} placeholder="e.g. RO Purifier" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Price (₹) *</Label><Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required /></div>
            <div><Label>Compare-at price (₹)</Label><Input type="number" step="0.01" value={compare_at_price} onChange={(e) => setCompare(e.target.value)} placeholder="Optional" /></div>
          </div>
          {!product && (
            <div className="grid grid-cols-2 gap-3">
              <div><Label>SKU</Label><Input value={sku} onChange={(e) => setSku(e.target.value)} /></div>
              <div><Label>Stock</Label><Input type="number" value={inventory_quantity} onChange={(e) => setQty(Number(e.target.value))} /></div>
            </div>
          )}

          <div>
            <Label className="flex items-center gap-2"><ImagePlus className="h-4 w-4" /> Images</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {product?.images?.map((im: any) => (
                <div key={im.id} className="relative h-20 w-20 overflow-hidden rounded-md border border-border opacity-70">
                  <img src={im.src} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
              {images.map((im, i) => (
                <div key={i} className="relative h-20 w-20 overflow-hidden rounded-md border border-primary">
                  <img src={im.preview} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute right-0 top-0 rounded-bl bg-black/70 p-0.5 text-white"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-secondary">
                <ImagePlus className="h-4 w-4" /> Upload
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFile(e.target.files)} />
              </label>
              <Input placeholder="Or paste image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="flex-1 min-w-[200px]" />
              <Button type="button" variant="outline" size="sm" onClick={addUrl}>Add URL</Button>
            </div>
            {product && images.length > 0 && (
              <label className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} />
                Replace all existing images
              </label>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (product ? "Save changes" : "Create product")}
          </Button>
        </div>
      </form>
    </div>
  );
}
