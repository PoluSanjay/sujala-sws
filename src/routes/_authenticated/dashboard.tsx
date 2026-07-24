import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CircleUser, FileText, ShieldCheck, Plus, ShoppingBag, Package } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/stores/cartStore";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "My Dashboard | Sujala" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [name, setName] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) return;
      const [roles, profile] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", userRes.user.id),
        supabase.from("profiles").select("full_name").eq("id", userRes.user.id).maybeSingle(),
      ]);
      setIsAdmin(!!roles.data?.some((r) => r.role === "admin"));
      setName(profile.data?.full_name || userRes.user.email || "");
    })();
  }, []);

  const orders = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("id, order_number, subtotal, status, payment_status, payment_method, created_at, items").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const complaints = useQuery({
    queryKey: ["my-complaints"],
    queryFn: async () => {
      const { data, error } = await supabase.from("complaints").select("id, ticket_number, category, status, priority, created_at").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <SiteShell>
      <section className="border-b border-border bg-gradient-soft">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-10 md:px-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-primary">Dashboard</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Hello, {name || "there"} 👋</h1>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button variant="outline" asChild><Link to="/admin"><ShieldCheck className="mr-1.5 h-4 w-4" /> Admin panel</Link></Button>
            )}
            <Button variant="outline" asChild><Link to="/products"><ShoppingBag className="mr-1.5 h-4 w-4" /> Shop</Link></Button>
            <Button asChild><Link to="/complaints"><Plus className="mr-1.5 h-4 w-4" /> New complaint</Link></Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6 space-y-10">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard i={Package} n={orders.data?.length ?? 0} l="My orders" />
          <StatCard i={FileText} n={complaints.data?.length ?? 0} l="My complaints" />
          <StatCard i={CircleUser} n={complaints.data?.filter(c => ["open","assigned","in_progress","waiting_parts"].includes(c.status)).length ?? 0} l="Open tickets" />
          <StatCard i={ShieldCheck} n={complaints.data?.filter(c => c.status === "resolved" || c.status === "closed").length ?? 0} l="Resolved" />
        </div>

        <div>
          <h2 className="text-xl font-bold">My orders</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            {orders.isLoading ? (
              <div className="p-6 text-sm text-muted-foreground">Loading…</div>
            ) : orders.data && orders.data.length > 0 ? (
              <div className="divide-y divide-border">
                {orders.data.map((o) => {
                  const items = Array.isArray(o.items) ? (o.items as any[]) : [];
                  return (
                    <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-secondary/40">
                      <div>
                        <div className="font-semibold text-primary">{o.order_number}</div>
                        <div className="text-sm text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""} • {new Date(o.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-semibold">{formatINR(Number(o.subtotal))}</div>
                          <div className="text-xs text-muted-foreground">{o.payment_method === "cod" ? "COD" : "Bank Transfer"}</div>
                        </div>
                        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium capitalize">{String(o.status)}</span>
                        <Button size="sm" variant="outline" asChild>
                          <Link to="/order/$number" params={{ number: o.order_number }}>View</Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-10 text-center">
                <p className="text-muted-foreground">No orders yet.</p>
                <Button asChild className="mt-4"><Link to="/products">Start shopping</Link></Button>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold">My complaints</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            {complaints.isLoading ? (
              <div className="p-6 text-sm text-muted-foreground">Loading…</div>
            ) : complaints.data && complaints.data.length > 0 ? (
              <div className="divide-y divide-border">
                {complaints.data.map((c) => (
                  <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-secondary/40">
                    <div>
                      <div className="font-semibold text-primary">{c.ticket_number}</div>
                      <div className="text-sm text-muted-foreground">{c.category} • {new Date(c.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium capitalize">{c.status.replace(/_/g, " ")}</span>
                      <Button size="sm" variant="outline" asChild><Link to="/track">Track</Link></Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center">
                <p className="text-muted-foreground">No complaints yet.</p>
                <Button asChild className="mt-4"><Link to="/complaints">Raise complaint</Link></Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function StatCard({ i: Icon, n, l }: { i: any; n: number; l: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <Icon className="h-6 w-6 text-primary" />
      <div className="mt-4 text-3xl font-bold">{n}</div>
      <div className="text-sm text-muted-foreground">{l}</div>
    </div>
  );
}
