import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, ImageIcon, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-purifier.jpg";

export const Route = createFileRoute("/_authenticated/admin/appearance")({
  head: () => ({
    meta: [
      { title: "Homepage image — Sujala Admin" },
      { name: "description", content: "Update the homepage hero image shown to customers on Sujala Water Solutions." },
      { property: "og:title", content: "Homepage image — Sujala Admin" },
      { property: "og:description", content: "Update the homepage hero image shown to customers." },
    ],
  }),
  component: AppearancePage,
});

function AppearancePage() {
  const qc = useQueryClient();
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: setting, isLoading } = useQuery({
    queryKey: ["site-setting", "hero_image_url"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "hero_image_url")
        .maybeSingle();
      if (error) throw error;
      return data?.value ?? "";
    },
  });

  useEffect(() => { if (setting !== undefined) setUrl(setting ?? ""); }, [setting]);

  const onFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `hero/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, {
        cacheControl: "3600", upsert: false, contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setUrl(data.publicUrl);
      toast.success("Image uploaded — click Save to publish");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally { setUploading(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "hero_image_url", value: url.trim() || null, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["site-setting", "hero_image_url"] });
      toast.success("Homepage image updated");
    } catch (e: any) {
      toast.error(e.message || "Could not save");
    } finally { setSaving(false); }
  };

  const preview = url || heroImg;

  return (
    <SiteShell>
      <section className="border-b border-border bg-gradient-soft">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-10 md:px-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-primary">Admin</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Homepage image</h1>
            <p className="mt-2 text-sm text-muted-foreground">Upload the main picture shown on the homepage banner.</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/admin"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to dashboard</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
            <div>
              <Label htmlFor="hero-file">Upload new image</Label>
              <div className="mt-2 flex items-center gap-3">
                <Input id="hero-file" type="file" accept="image/*" onChange={(e) => onFile(e.target.files)} disabled={uploading} />
                {uploading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">JPG or PNG, up to 5MB. Landscape looks best.</p>
            </div>

            <div>
              <Label htmlFor="hero-url">Or paste an image link</Label>
              <Input id="hero-url" className="mt-2" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={save} disabled={saving || isLoading}>
                {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Upload className="mr-1.5 h-4 w-4" />}
                Save
              </Button>
              <Button variant="outline" onClick={() => setUrl("")} disabled={saving}>Reset to default</Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <ImageIcon className="h-4 w-4 text-primary" /> Preview
            </div>
            <div className="overflow-hidden rounded-2xl ring-1 ring-black/5">
              <img src={preview} alt="Homepage banner preview" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
