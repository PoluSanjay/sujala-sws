import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact us | Sujala Water Solutions" },
      { name: "description", content: "Call, email or WhatsApp Sujala Water Solutions for sales, service, or AMC plans." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SiteShell>
      <section className="border-b border-border bg-gradient-soft">
        <div className="mx-auto max-w-5xl px-4 py-16 md:px-6">
          <div className="text-xs font-bold uppercase tracking-widest text-primary">Contact</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">We're here to help</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Reach us by phone, WhatsApp or email — we usually respond within an hour.</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 md:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          <Card icon={Phone} title="Call us" primary="+91 9949792248" desc="Mon–Sun · 9am – 9pm" href="tel:+919949792248" cta="Call now" />
          <Card icon={MessageCircle} title="WhatsApp" primary={"+91 9949792248\n\n"} desc="Quick replies 24×7" href="https://wa.me/919949792248" cta="Open WhatsApp" />
          <Card icon={Mail} title="Email" primary="2303a51731@sru.edu.in" desc="Support & AMC queries" href="mailto:2303a51731@sru.edu.in" cta="Send email" />
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-8 shadow-card">
          <MapPin className="h-6 w-6 text-primary" />
          <div className="mt-2 text-lg font-semibold">Service coverage</div>
          <p className="mt-1 text-sm text-muted-foreground">
            We serve customers across major cities in India. Enter your PIN code while booking a service and we'll confirm the technician availability instantly.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}

function Card({ icon: Icon, title, primary, desc, href, cta }: any) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card">
      <Icon className="h-6 w-6 text-primary" />
      <div className="mt-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">{title}</div>
      <div className="mt-1 text-xl font-bold">{primary}</div>
      <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
      <Button variant="outline" asChild className="mt-4 w-full"><a href={href}>{cta}</a></Button>
    </div>
  );
}
