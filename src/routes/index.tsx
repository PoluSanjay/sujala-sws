import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Droplet, ShieldCheck, Wrench, Clock, Award, ArrowRight, Phone,
  MessageCircle, Sparkles, CheckCircle2, HeadphonesIcon, Factory, Building2, Waves
} from "lucide-react";
import heroImg from "@/assets/hero-purifier.jpg";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/stores/cartStore";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sujala Water Solutions — Better Service for Better Purification" },
      { name: "description", content: "Premium RO water purifiers, expert installation, AMC plans, and 24×7 repair service. Cash on Delivery available." },
      { property: "og:title", content: "Sujala Water Solutions" },
      { property: "og:description", content: "Premium RO water purifiers, expert installation, AMC plans, and 24×7 repair service." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: featured } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, slug, name, brand, price, discount_price, image_url")
        .eq("is_active", true)
        .eq("is_featured", true)
        .limit(4);
      if (error) throw error;
      if (data && data.length > 0) return data;
      const { data: fallback } = await supabase
        .from("products")
        .select("id, slug, name, brand, price, discount_price, image_url")
        .eq("is_active", true)
        .limit(4);
      return fallback ?? [];
    },
  });

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-gradient-soft">
        <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary-glow/20 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Better Service for Better Purification
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl">
              Pure water,
              <span className="block bg-gradient-accent bg-clip-text text-transparent">delivered with care.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              India's trusted destination for RO water purifiers, installation, AMC plans,
              spare parts and expert service. Cash on Delivery & Bank Transfer accepted.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild><Link to="/products">Shop Purifiers <ArrowRight className="ml-1.5 h-4 w-4" /></Link></Button>
              <Button size="lg" variant="outline" asChild><Link to="/services">Book Service</Link></Button>
              <Button size="lg" variant="ghost" asChild><a href="tel:+919949792248"><Phone className="mr-1.5 h-4 w-4" /> Call Now</a></Button>
            </div>
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-6 text-center">
              <Stat n="10k+" l="Happy homes" />
              <Stat n="24×7" l="Service support" />
              <Stat n="4.8★" l="Customer rating" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -m-4 rounded-3xl bg-gradient-hero opacity-20 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-elegant ring-1 ring-black/5">
              <img src={heroImg} alt="Sujala RO water purifier" width={1600} height={1200} className="h-full w-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-white p-4 shadow-hover ring-1 ring-black/5 md:block">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-success/15">
                  <ShieldCheck className="h-5 w-5 text-success" />
                </div>
                <div>
                  <div className="text-sm font-semibold">1 Year Warranty</div>
                  <div className="text-xs text-muted-foreground">Free installation included</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-background">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-border md:grid-cols-4">
          {[
            { icon: Droplet, l: "Buy Purifier", to: "/products" },
            { icon: Wrench, l: "Book Repair", to: "/complaints" },
            { icon: HeadphonesIcon, l: "AMC Plans", to: "/services" },
            { icon: MessageCircle, l: "Track Complaint", to: "/track" },
          ].map((a) => (
            <Link key={a.l} to={a.to} className="group flex items-center justify-center gap-3 bg-background px-4 py-6 transition-colors hover:bg-secondary">
              <a.icon className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
              <span className="text-sm font-semibold">{a.l}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <SectionHead eyebrow="Explore" title="What we offer" subtitle="From compact home RO to full industrial plants." />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { icon: Droplet, t: "Domestic RO", d: "Compact, high-purity RO for homes.", to: "/products" },
            { icon: Building2, t: "Commercial RO", d: "For offices, restaurants, cafés.", to: "/products" },
            { icon: Factory, t: "Industrial Plants", d: "Large scale RO up to 1000+ LPH.", to: "/products" },
            { icon: Waves, t: "Water Softeners", d: "Whole-house hard water treatment.", to: "/products" },
            { icon: Wrench, t: "Installation & Repair", d: "Trained technicians, same-day service.", to: "/services" },
            { icon: ShieldCheck, t: "AMC Plans", d: "Yearly maintenance with genuine parts.", to: "/services" },
          ].map((c) => (
            <Link key={c.t} to={c.to} className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-hover">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-hero text-white shadow-card">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{c.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6">
          <SectionHead eyebrow="Best sellers" title="Featured products" subtitle="Handpicked purifiers with the best value." action={{ to: "/products", label: "View all" }} />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured?.map((p) => {
              const price = p.discount_price ?? p.price;
              return (
                <Link key={p.id} to="/products/$slug" params={{ slug: p.slug }} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-hover">
                  <div className="aspect-[4/3] overflow-hidden bg-gradient-soft">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-primary/20"><Droplet className="h-16 w-16" /></div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{p.brand}</div>
                    <div className="line-clamp-2 text-sm font-semibold">{p.name}</div>
                    <div className="mt-auto pt-3">
                      <span className="text-lg font-bold text-primary">{formatINR(Number(price))}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
            {featured && featured.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                No products yet. Add some from the admin panel.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <SectionHead eyebrow="Why Sujala" title="Trusted by thousands of families" />
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            { i: Award, t: "Certified experts", d: "Trained, background-verified technicians." },
            { i: Clock, t: "Fast response", d: "Same-day service for most cities." },
            { i: ShieldCheck, t: "Genuine parts", d: "Only OEM-approved membranes & filters." },
            { i: CheckCircle2, t: "Transparent pricing", d: "No hidden charges. Ever." },
          ].map((f) => (
            <div key={f.t} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <f.i className="h-5 w-5" />
              </div>
              <div className="mt-4 font-semibold">{f.t}</div>
              <div className="mt-1 text-sm text-muted-foreground">{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 shadow-elegant md:p-16">
          <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-bold text-white md:text-4xl">Need service today?</h2>
              <p className="mt-2 max-w-xl text-white/85">Raise a complaint and we'll dispatch a certified technician.</p>
            </div>
            <div className="flex gap-3">
              <Button size="lg" variant="secondary" asChild><Link to="/complaints">Raise complaint</Link></Button>
              <Button size="lg" variant="outline" asChild className="border-white/40 bg-white/0 text-white hover:bg-white hover:text-primary">
                <a href="tel:+919949792248">Call now</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-foreground md:text-3xl">{n}</div>
      <div className="mt-1 text-xs text-muted-foreground">{l}</div>
    </div>
  );
}
function SectionHead({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle?: string; action?: { to: string; label: string } }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</div>
        <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
        {subtitle && <p className="mt-2 max-w-xl text-muted-foreground">{subtitle}</p>}
      </div>
      {action && (
        <Link to={action.to} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          {action.label} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
