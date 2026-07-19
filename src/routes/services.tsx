import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, ShieldCheck, Wrench, Droplet, Waves, Factory, HeadphonesIcon } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Installation, Repair & AMC | Sujala Water Solutions" },
      { name: "description", content: "Professional RO installation, repair, filter replacement, AMC and water testing. Same-day service in most cities." },
    ],
  }),
  component: ServicesPage,
});

const services = [
  { icon: Wrench, title: "RO Installation", price: "₹499", desc: "Certified technician, full setup and demo. Free with new purchases.", features: ["Wall mounting", "Water line setup", "Demo & training"] },
  { icon: Wrench, title: "Repair Service", price: "₹399+", desc: "Any brand, any issue. Genuine parts guaranteed.", features: ["45-day service warranty", "Original parts", "Transparent billing"] },
  { icon: ShieldCheck, title: "AMC Plans", price: "₹2,999/yr", desc: "3 or 4 scheduled visits, priority support, unlimited service calls.", features: ["Filter replacements included", "Priority technician", "Unlimited breakdown visits"] },
  { icon: Droplet, title: "Filter Replacement", price: "₹599+", desc: "Genuine sediment, carbon, and RO membrane replacement.", features: ["Home service", "OEM parts", "Water quality test"] },
  { icon: Waves, title: "Water Softener Setup", price: "On quote", desc: "Whole-house softener installation for hard-water areas.", features: ["Custom sizing", "Plumbing included", "1-year warranty"] },
  { icon: Factory, title: "Commercial / Industrial", price: "On quote", desc: "Design, install, and maintain commercial and industrial RO plants.", features: ["Site survey", "Turnkey installation", "AMC options"] },
];

function ServicesPage() {
  return (
    <SiteShell>
      <section className="border-b border-border bg-gradient-soft">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="text-xs font-bold uppercase tracking-widest text-primary">Our services</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">Installation, repair & AMC</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Trained technicians, transparent pricing, and genuine parts across every service we offer.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" asChild><Link to="/complaints">Book service</Link></Button>
            <Button size="lg" variant="outline" asChild><a href="tel:+919999999999">Call helpline</a></Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.title} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-hover">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-hero text-white shadow-card">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <div className="mt-1 text-sm font-semibold text-primary">Starting {s.price}</div>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              <ul className="mt-4 space-y-1.5">
                {s.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" asChild className="mt-6"><Link to="/complaints">Book now</Link></Button>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <h2 className="text-3xl font-bold">How it works</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              { s: "01", t: "Book", d: "Raise a complaint or call us." },
              { s: "02", t: "Assign", d: "We assign a trained technician." },
              { s: "03", t: "Service", d: "Diagnose and fix at your doorstep." },
              { s: "04", t: "Warranty", d: "45-day service warranty included." },
            ].map((step) => (
              <div key={step.s} className="rounded-2xl border border-border bg-card p-6">
                <div className="text-3xl font-bold text-primary/20">{step.s}</div>
                <div className="mt-2 text-lg font-semibold">{step.t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{step.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
