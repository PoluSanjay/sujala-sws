import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertOctagon, Package, ShieldOff, Users } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin panel | Sujala" }] }),
  component: AdminPage,
});

const STATUSES = ["open","assigned","in_progress","waiting_parts","resolved","closed","cancelled"] as const;

function AdminPage() {
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
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-destructive/10">
          <ShieldOff className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="mt-6 text-3xl font-bold">Admins only</h1>
        <p className="mt-2 text-muted-foreground">
          Your account doesn't have admin access yet. Ask a super admin to grant the role,
          or run: <code className="rounded bg-secondary px-1.5 py-0.5">INSERT INTO user_roles(user_id, role) VALUES ('&lt;your-id&gt;', 'admin')</code>
        </p>
        <Button asChild className="mt-6"><Link to="/dashboard">Back to dashboard</Link></Button>
      </div>
    </SiteShell>
  );

  return <AdminInner />;
}

function AdminInner() {
  const qc = useQueryClient();
  const complaints = useQuery({
    queryKey: ["admin-complaints"],
    queryFn: async () => {
      const { data, error } = await supabase.from("complaints").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const products = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id, name, brand, price, discount_price, stock, is_active").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("complaints").update({ status: status as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-complaints"] }); toast.success("Status updated"); },
    onError: (e: any) => toast.error(e.message),
  });

  const stats = {
    open: complaints.data?.filter(c => c.status === "open").length ?? 0,
    active: complaints.data?.filter(c => ["assigned","in_progress","waiting_parts"].includes(c.status)).length ?? 0,
    total: complaints.data?.length ?? 0,
  };

  return (
    <SiteShell>
      <section className="border-b border-border bg-gradient-soft">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
          <div className="text-xs font-bold uppercase tracking-widest text-primary">Admin</div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Operations dashboard</h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Stat i={AlertOctagon} n={stats.open} l="New complaints" c="text-destructive" />
          <Stat i={Users} n={stats.active} l="In progress" c="text-warning" />
          <Stat i={Package} n={stats.total} l="Total tickets" c="text-primary" />
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-bold">Complaints</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
            <table className="min-w-full text-sm">
              <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Ticket</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Priority</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {complaints.data?.map((c) => (
                  <tr key={c.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-semibold text-primary">{c.ticket_number}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.phone}</div>
                    </td>
                    <td className="px-4 py-3">{c.category}</td>
                    <td className="px-4 py-3">
                      <span className={"rounded-full px-2 py-0.5 text-xs font-semibold capitalize " + (
                        c.priority === "emergency" ? "bg-destructive/15 text-destructive"
                        : c.priority === "high" ? "bg-warning/20 text-warning-foreground"
                        : "bg-secondary text-muted-foreground"
                      )}>{c.priority}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={c.status}
                        onChange={(e) => updateStatus.mutate({ id: c.id, status: e.target.value })}
                        className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {complaints.data?.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No complaints yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-bold">Products ({products.data?.length ?? 0})</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
            <table className="min-w-full text-sm">
              <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Brand</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.data?.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.brand}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-semibold text-primary">₹{(p.discount_price ?? p.price).toLocaleString("en-IN")}</div>
                      {p.discount_price && <div className="text-xs text-muted-foreground line-through">₹{p.price.toLocaleString("en-IN")}</div>}
                    </td>
                    <td className="px-4 py-3 text-right">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span className={"rounded-full px-2 py-0.5 text-xs font-semibold " + (p.is_active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
                        {p.is_active ? "Active" : "Hidden"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Product create/edit UI comes next. For now, use the database tools to add products.</p>
        </div>
      </section>
    </SiteShell>
  );
}

function Stat({ i: Icon, n, l, c }: { i: any; n: number; l: string; c: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <Icon className={"h-6 w-6 " + c} />
      <div className="mt-4 text-3xl font-bold">{n}</div>
      <div className="text-sm text-muted-foreground">{l}</div>
    </div>
  );
}
