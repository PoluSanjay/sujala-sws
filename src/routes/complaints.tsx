import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Copy } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/complaints")({
  head: () => ({
    meta: [
      { title: "Raise a Complaint | Sujala Water Solutions" },
      { name: "description", content: "Report a problem with your water purifier and get quick service. Free complaint tracking with SMS updates." },
    ],
  }),
  component: ComplaintsPage,
});

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(20),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  address: z.string().trim().min(5).max(500),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  category: z.string().min(1),
  description: z.string().trim().min(10).max(2000),
  priority: z.enum(["normal", "high", "emergency"]),
});

const CATEGORIES = [
  "Water Leakage", "Low Water Flow", "Bad Taste", "Filter Replacement",
  "Motor Issue", "No Power", "Service Delay", "Installation", "Other",
];

function ComplaintsPage() {
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd.entries()));
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast.error(first?.message ?? "Please check the form");
      setSubmitting(false);
      return;
    }
    const { data: userRes } = await supabase.auth.getUser();
    const payload = {
      ...parsed.data,
      email: parsed.data.email || null,
      city: parsed.data.city || null,
      user_id: userRes.user?.id ?? null,
    };
    const { data, error } = await supabase.from("complaints").insert(payload).select("ticket_number").single();
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setTicket(data.ticket_number);
    toast.success("Complaint submitted");
  };

  if (ticket) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center md:px-6">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h1 className="mt-6 text-3xl font-bold">Complaint received</h1>
          <p className="mt-2 text-muted-foreground">Our team will contact you within 2 business hours.</p>

          <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your ticket number</div>
            <div className="mt-2 flex items-center justify-center gap-3">
              <div className="text-3xl font-bold tracking-wider text-primary">{ticket}</div>
              <button
                onClick={() => { navigator.clipboard.writeText(ticket); toast.success("Copied"); }}
                className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-secondary"
                aria-label="Copy"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Save this number to track status anytime.</p>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild><Link to="/track" search={{ ticket } as any}>Track this complaint</Link></Button>
            <Button variant="outline" onClick={() => { setTicket(null); navigate({ to: "/complaints" }); }}>Submit another</Button>
          </div>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="border-b border-border bg-gradient-soft">
        <div className="mx-auto max-w-4xl px-4 py-14 md:px-6">
          <div className="text-xs font-bold uppercase tracking-widest text-primary">Support</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">Raise a complaint</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Tell us what's wrong and we'll dispatch a technician. You'll get a tracking number instantly.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 md:px-6">
        <form onSubmit={onSubmit} className="grid gap-5 rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Your name" required><Input name="name" required maxLength={100} placeholder="Full name" /></Field>
            <Field label="Phone number" required><Input name="phone" required maxLength={20} placeholder="+91 …" /></Field>
            <Field label="Email"><Input name="email" type="email" placeholder="you@example.com" /></Field>
            <Field label="City"><Input name="city" maxLength={100} placeholder="e.g. Hyderabad" /></Field>
          </div>
          <Field label="Address" required>
            <Textarea name="address" required rows={2} maxLength={500} placeholder="House / flat, area, landmark" />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Issue category" required>
              <select name="category" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Priority" required>
              <select name="priority" required defaultValue="normal" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="normal">Normal — within 2 days</option>
                <option value="high">High — within 24h</option>
                <option value="emergency">Emergency — ASAP</option>
              </select>
            </Field>
          </div>

          <Field label="Describe the problem" required>
            <Textarea name="description" required rows={5} maxLength={2000} placeholder="Water leaking from bottom, motor running but no output, etc." />
          </Field>

          <div className="flex items-center gap-2 rounded-lg bg-warning/10 p-3 text-xs text-warning-foreground">
            <AlertTriangle className="h-4 w-4 text-warning" />
            For emergencies please also call our 24×7 helpline.
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">You'll receive a tracking number to view live status.</div>
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit complaint"}
            </Button>
          </div>
        </form>
      </section>
    </SiteShell>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm font-medium">
        {label}{required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}
