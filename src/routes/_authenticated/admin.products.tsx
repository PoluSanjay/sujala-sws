import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Pencil, Plus, ShieldOff, Trash2, X } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/stores/cartStore";

export const Route = createFileRoute("/_authenticated/admin/products")({
  validateSearch: (search) => ({
    edit: typeof search.edit === "string" ? search.edit : undefined,
  }),
  head: () => ({ meta: [{ title: "Manage Products | Sujala Admin" }] }),
  component: Gate,
});

function Gate() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) { setIsAdmin(false); return; }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", userRes.user.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!data);
    })();
  }, []);
  if (isAdmin === null) return <SiteShell><div className="mx-auto max-w-7xl px-4 py-16">Checking permissions…</div></SiteShell>;
  if (!isAdmin) return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-destructive/10"><ShieldOff className="h-8 w-8 text-destructive" /></div>
        <h1 className="mt-6 text-3xl font-bold">Admins only</h1>
        <Button asChild className="mt-6"><Link to="/dashboard">Back to dashboard</Link></Button>
      </div>
    </SiteShell>
  );
  return <AdminProducts />;
}

type Product = {
  id: string; slug: string; name: string; brand: string | null; description: string | null;
  price: number; discount_price: number | null; stock: number; image_url: string | null;
  warranty: string | null; is_active: boolean; is_featured: boolean; category_id: string | null;
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

function AdminProducts() {
  const qc = useQueryClient();
  const search = Route.useSearch();

  const products = useQuery({
    queryKey: ["admin-products-full"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("id, name").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!search.edit || !products.data?.length) return;
    const selected = products.data.find((product) => product.id === search.edit);
    if (selected) setEditing(selected);
  }, [products.data, search.edit]);

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Product deleted"); qc.invalidateQueries({ queryKey: ["admin-products-full"] }); qc.invalidateQueries({ queryKey: ["products"] }); },
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
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Edit products</h1>
            <p className="text-sm text-muted-foreground">Use each product card's Edit button to change price, stock, image and details.</p>
          </div>
          <Button onClick={() => setCreating(true)}><Plus className="mr-1.5 h-4 w-4" /> Add product</Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        {products.isLoading && <div className="text-muted-foreground">Loading…</div>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.data?.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              <div className="aspect-square bg-secondary/40">
                {p.image_url ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-muted-foreground">No image</div>}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.brand} • {p.is_active ? "Active" : "Hidden"}{p.is_featured ? " • Featured" : ""}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{formatINR(Number(p.discount_price ?? p.price))}</div>
                    {p.discount_price && <div className="text-xs text-muted-foreground line-through">{formatINR(Number(p.price))}</div>}
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">Stock: {p.stock}</div>
                 <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditing(p)}>
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Edit price / image
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive"
                    onClick={() => confirm(`Delete "${p.name}"?`) && del.mutate(p.id)} disabled={del.isPending}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {products.data?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground">
            No products yet. Click "Add product" to create your first one.
          </div>
        )}
      </section>

      {(creating || editing) && (
        <ProductForm
          product={editing}
          categories={categories.data ?? []}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["admin-products-full"] }); qc.invalidateQueries({ queryKey: ["products"] }); qc.invalidateQueries({ queryKey: ["featured-products"] }); setEditing(null); setCreating(false); }}
        />
      )}
    </SiteShell>
  );
}

function ProductForm({
  product, categories, onClose, onSaved,
}: { product: Product | null; categories: { id: string; name: string }[]; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "Sujala");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState<string>(product?.price ? String(product.price) : "");
  const [discountPrice, setDiscountPrice] = useState<string>(product?.discount_price ? String(product.discount_price) : "");
  const [stock, setStock] = useState<string>(product?.stock !== undefined ? String(product.stock) : "10");
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [warranty, setWarranty] = useState(product?.warranty ?? "1 Year");
  const [categoryId, setCategoryId] = useState<string>(product?.category_id ?? "");
  const [isActive, setIsActive] = useState<boolean>(product?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState<boolean>(product?.is_featured ?? false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { if (!product && name && !slug) setSlug(slugify(name)); }, [name]);

  const onFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, {
        cacheControl: "3600", upsert: false, contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setImageUrl(data.publicUrl);
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally { setUploading(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim()) { toast.error("Name and price are required"); return; }
    setSaving(true);
    try {
      const payload: any = {
        name: name.trim(),
        slug: (slug || slugify(name)).trim(),
        brand: brand || null,
        description: description || null,
        price: Number(price),
        discount_price: discountPrice ? Number(discountPrice) : null,
        stock: Number(stock) || 0,
        image_url: imageUrl || null,
        warranty: warranty || null,
        category_id: categoryId || null,
        is_active: isActive,
        is_featured: isFeatured,
      };
      if (product) {
        const { error } = await supabase.from("products").update(payload).eq("id", product.id);
        if (error) throw error;
        toast.success("Product updated");
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        toast.success("Product created");
      }
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-background p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{product ? "Edit product" : "Add product"}</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 hover:bg-secondary"><X className="h-5 w-5" /></button>
        </div>

        <div className="grid gap-4">
          <div><Label>Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Slug (URL)</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated" /></div>
            <div><Label>Brand</Label><Input value={brand} onChange={(e) => setBrand(e.target.value)} /></div>
          </div>
          <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Price (₹) *</Label><Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required /></div>
            <div><Label>Sale price (₹)</Label><Input type="number" step="0.01" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} placeholder="Optional" /></div>
            <div><Label>Stock</Label><Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Warranty</Label><Input value={warranty} onChange={(e) => setWarranty(e.target.value)} placeholder="e.g. 1 Year" /></div>
            <div>
              <Label>Category</Label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">— None —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <Label>Image</Label>
            <div className="mt-2 flex items-start gap-3">
              {imageUrl && <img src={imageUrl} alt="" className="h-24 w-24 rounded-md border border-border object-cover" />}
              <div className="flex-1 space-y-2">
                <Input placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-secondary">
                  {uploading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…</> : "Upload file"}
                  <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => onFile(e.target.files)} />
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Active (visible on shop)</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} /> Featured (homepage)</label>
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
