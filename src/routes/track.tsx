import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Clock, PackageSearch, Wrench } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track your complaint | Sujala Water Solutions" },
      { name: "description", content: "Enter your ticket number to see live status of your service complaint." },
    ],
  }),
  component: TrackPage,
});

const STATUS_STEPS = [
  { key: "open", label: "Received" },
  { key: "assigned", label: "Technician assigned" },
  { key: "in_progress", label: "In progress" },
  { key: "resolved", label: "Resolved" },
] as const;

type Complaint = {
  ticket_number: string; name: string; category: string; priority: string;
  status: string; description: string; city: string | null;
  created_at: string; updated_at: string; resolution_notes: string | null;
};

function TrackPage() {
  const [ticket, setTicket] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Complaint | null>(null);
  const [notFound, setNotFound] = useState(false);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket.trim()) return;
    setLoading(true); setNotFound(false); setData(null);
    const { data: rows, error } = await supabase.rpc("get_complaint_by_ticket", { _ticket: ticket.trim() });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row) { setNotFound(true); return; }
    setData(row as Complaint);
  };

  const currentStep = data ? Math.max(0, STATUS_STEPS.findIndex((s) => s.key === data.status)) : -1;

  return (
    <SiteShell>
      <section className="border-b border-border bg-gradient-soft">
        <div className="mx-auto max-w-3xl px-4 py-14 md:px-6">
          <div className="text-xs font-bold uppercase tracking-widest text-primary">Track</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">Track your complaint</h1>
          <p className="mt-2 text-muted-foreground">Enter your SWS-xxxx ticket number to see the latest status.</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <form onSubmit={search} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 shadow-card sm:flex-row">
          <Input value={ticket} onChange={(e) => setTicket(e.target.value)} placeholder="e.g. SWS-1001" className="h-12 flex-1 text-base" />
          <Button type="submit" size="lg" disabled={loading}>{loading ? "Searching…" : "Track"}</Button>
        </form>

        {notFound && (
          <div className="mt-6 rounded-2xl border border-dashed border-border p-10 text-center">
            <PackageSearch className="mx-auto h-10 w-10 text-muted-foreground" />
            <div className="mt-3 font-semibold">No complaint found</div>
            <p className="mt-1 text-sm text-muted-foreground">Please check the ticket number and try again.</p>
          </div>
        )}

        {data && (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Ticket</div>
                  <div className="text-2xl font-bold text-primary">{data.ticket_number}</div>
                </div>
                <StatusPill status={data.status} />
              </div>
              <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <div><span className="text-muted-foreground">Customer:</span> <span className="font-medium">{data.name}</span></div>
                <div><span className="text-muted-foreground">Issue:</span> <span className="font-medium">{data.category}</span></div>
                <div><span className="text-muted-foreground">Priority:</span> <span className="font-medium capitalize">{data.priority}</span></div>
                <div><span className="text-muted-foreground">City:</span> <span className="font-medium">{data.city || "—"}</span></div>
              </div>
              <div className="mt-4 border-t border-border pt-4">
                <div className="text-xs text-muted-foreground">Description</div>
                <div className="mt-1 text-sm">{data.description}</div>
              </div>
              {data.resolution_notes && (
                <div className="mt-4 rounded-lg bg-success/10 p-3 text-sm">
                  <div className="text-xs font-semibold uppercase text-success">Technician notes</div>
                  <div className="mt-1">{data.resolution_notes}</div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-semibold">Progress</h3>
              <ol className="mt-6 space-y-6">
                {STATUS_STEPS.map((step, i) => {
                  const done = currentStep >= i;
                  const current = currentStep === i;
                  return (
                    <li key={step.key} className="flex items-start gap-4">
                      <div className={"grid h-9 w-9 place-items-center rounded-full border-2 " + (done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground")}>
                        {done ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className={"font-medium " + (current ? "text-primary" : done ? "text-foreground" : "text-muted-foreground")}>
                          {step.label}
                        </div>
                        {current && <div className="text-xs text-muted-foreground">Updated {new Date(data.updated_at).toLocaleString()}</div>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}
      </section>
    </SiteShell>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { l: string; c: string }> = {
    open: { l: "Received", c: "bg-primary/10 text-primary" },
    assigned: { l: "Assigned", c: "bg-primary-glow/20 text-primary" },
    in_progress: { l: "In progress", c: "bg-warning/20 text-warning-foreground" },
    waiting_parts: { l: "Waiting for parts", c: "bg-warning/20 text-warning-foreground" },
    resolved: { l: "Resolved", c: "bg-success/15 text-success" },
    closed: { l: "Closed", c: "bg-muted text-muted-foreground" },
    cancelled: { l: "Cancelled", c: "bg-destructive/15 text-destructive" },
  };
  const s = map[status] ?? { l: status, c: "bg-muted text-muted-foreground" };
  return <span className={"inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold " + s.c}>{s.l}</span>;
}
