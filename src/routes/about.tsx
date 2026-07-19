import { createFileRoute } from "@tanstack/react-router";
import { Award, Droplet, Heart, ShieldCheck, Users } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About us | Sujala Water Solutions" },
      { name: "description", content: "Sujala Water Solutions delivers premium water purification with a customer-first service network." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteShell>
      <section className="border-b border-border bg-gradient-soft">
        <div className="mx-auto max-w-5xl px-4 py-16 md:px-6">
          <div className="text-xs font-bold uppercase tracking-widest text-primary">About Sujala</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">Better Service for Better Purification</h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            Sujala Water Solutions is a customer-obsessed water purification company delivering
            RO sales, installation, service and AMC plans. Our mission is simple — make safe drinking
            water effortless for every home and business.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 md:px-6">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
            <Droplet className="h-8 w-8 text-primary" />
            <h2 className="mt-4 text-2xl font-bold">Our mission</h2>
            <p className="mt-2 text-muted-foreground">
              Deliver pure water to every family, backed by fast, honest service you can trust.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
            <Heart className="h-8 w-8 text-primary" />
            <h2 className="mt-4 text-2xl font-bold">Our values</h2>
            <p className="mt-2 text-muted-foreground">
              Transparency, expertise, and empathy — in every call, every visit, every install.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto max-w-5xl px-4 py-16 md:px-6">
          <h2 className="text-3xl font-bold">Why customers choose us</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <Stat i={Users} n="10,000+" l="Homes served" />
            <Stat i={Award} n="8+ years" l="Of trust" />
            <Stat i={ShieldCheck} n="4.8★" l="Average rating" />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function Stat({ i: Icon, n, l }: { i: any; n: string; l: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <Icon className="h-6 w-6 text-primary" />
      <div className="mt-4 text-3xl font-bold">{n}</div>
      <div className="text-sm text-muted-foreground">{l}</div>
    </div>
  );
}
