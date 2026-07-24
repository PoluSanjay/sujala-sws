import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertOctagon, Package, ShieldOff, ShoppingBag, Users, Wallet } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/stores/cartStore";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin panel | Sujala" }] }),
  component: AdminPage,
});

const COMPLAINT_STATUSES = ["open","assigned","in_progress","waiting_parts","resolved","closed","cancelled"] as const;
const ORDER_STATUSES = ["pending","confirmed","processing","shipped","delivered","cancelled"] as const;
const PAY_STATUSES = ["unpaid","awaiting_verification","paid","refunded"] as const;

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
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-destructive/10"><ShieldOff className="h-8 w-8 text-destructive" /></div>
        <h1 className="mt-6 text-3xl font-bold">Admins only</h1>
        <p className="mt-2 text-muted-foreground">Ask an existing admin to grant you the admin role.</p>
        <Button asChild className="mt-6"><Link to="/dashboard">Back to dashboard</Link></Button>
      </div>
    </SiteShell>
  );
  return <AdminInner />;
}

function AdminInner() {
  const qc = useQueryClient();
  const orders = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
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

  const updateOrder = useMutation({
    mutationFn: async (v: { id: string; status?: string; payment_status?: string }) => {
      const patch: any = {};
      if (v.status) patch.status = v.status;
      if (v.payment_status) patch.payment_status = v.payment_status;
      const { error } = await supabase.from("orders").update(patch).eq("id", v.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-orders"] }); toast.success("Order updated"); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateComplaint = useMutation({
    mutationFn: async (v: { id: string; status: string }) => {
      const { error } = await supabase.from("complaints").update({ status: v.status as any }).eq("id", v.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-complaints"] }); toast.success("Status updated"); },
    onError: (e: any) => toast.error(e.message),
  });

  const revenue = (orders.data ?? []).reduce((s, o) => s + Number(o.subtotal || 0), 0);

  return (
    <SiteShell>
      <section className="border-b border-border bg-gradient-soft">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-10 md:px-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-primary">Admin</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Operations dashboard</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild><Link to="/admin/products"><Package className="mr-1.5 h-4 w-4" /> Manage products</Link></Button>
            <Button variant="outline" asChild><Link to="/admin/payment"><Wallet className="mr-1.5 h-4 w-4" /> Bank details</Link></Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6 space-y-10">
        <div className="grid gap-4 md:grid-cols-4">
          <Stat i={ShoppingBag} n={orders.data?.length ?? 0} l="Total orders" c="text-primary" />
          <Stat i={Wallet} n={formatINR(revenue)} l="Order value" c="text-success" isString />
          <Stat i={AlertOctagon} n={complaints.data?.filter(c => c.status === "open").length ?? 0} l="New complaints" c="text-destructive" />
          <Stat i={Users} n={complaints.data?.length ?? 0} l="Total complaints" c="text-warning" />
        </div>

        {/* ORDERS */}
        <div>
          <h2 className="text-xl font-bold">Orders ({orders.data?.length ?? 0})</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
            <table className="min-w-full text-sm">
              <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Address</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.data?.map((o) => {
                  const items = Array.isArray(o.items) ? (o.items as any[]) : [];
                  return (
                    <tr key={o.id} className="hover:bg-secondary/30 align-top">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-primary">{o.order_number}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</div>
                        <details className="mt-1 text-xs">
                          <summary className="cursor-pointer text-primary hover:underline">Items</summary>
                          <ul className="mt-1 space-y-0.5">
                            {items.map((i, idx) => <li key={idx}>{i.quantity}× {i.name}</li>)}
                          </ul>
                        </details>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{o.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{o.phone}</div>
                        {o.email && <div className="text-xs text-muted-foreground">{o.email}</div>}
                      </td>
                      <td className="px-4 py-3 max-w-xs text-xs text-muted-foreground">
                        {o.address}
                        {(o.city || o.pincode) && <div>{[o.city, o.pincode].filter(Boolean).join(" — ")}</div>}
                        {o.notes && <div className="mt-1 italic">Note: {o.notes}</div>}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{formatINR(Number(o.subtotal))}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-medium">{o.payment_method === "cod" ? "COD" : "Bank"}</div>
                        <select value={o.payment_status} onChange={(e) => updateOrder.mutate({ id: o.id, payment_status: e.target.value })}
                          className="mt-1 rounded-md border border-input bg-background px-2 py-1 text-xs">
                          {PAY_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select value={o.status} onChange={(e) => updateOrder.mutate({ id: o.id, status: e.target.value })}
                          className="rounded-md border border-input bg-background px-2 py-1 text-xs">
                          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</td>
                    </tr>
                  );
                })}
                {orders.data?.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* COMPLAINTS */}
        <div>
          <h2 className="text-xl font-bold">Complaints ({complaints.data?.length ?? 0})</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
            <table className="min-w-full text-sm">
              <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Ticket</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Address</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Priority</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {complaints.data?.map((c) => (
                  <tr key={c.id} className="hover:bg-secondary/30 align-top">
                    <td className="px-4 py-3 font-semibold text-primary">{c.ticket_number}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.phone}</div>
                      {c.email && <div className="text-xs text-muted-foreground">{c.email}</div>}
                    </td>
                    <td className="px-4 py-3 max-w-xs text-xs text-muted-foreground">
                      {c.address}
                      {c.city && <div>{c.city}</div>}
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
                      <select value={c.status} onChange={(e) => updateComplaint.mutate({ id: c.id, status: e.target.value })}
                        className="rounded-md border border-input bg-background px-2 py-1 text-xs">
                        {COMPLAINT_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {complaints.data?.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No complaints yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PRODUCTS quick view */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Products ({products.data?.length ?? 0})</h2>
            <Button asChild size="sm"><Link to="/admin/products">Manage products</Link></Button>
          </div>
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
                      <div className="font-semibold text-primary">{formatINR(Number(p.discount_price ?? p.price))}</div>
                      {p.discount_price && <div className="text-xs text-muted-foreground line-through">{formatINR(Number(p.price))}</div>}
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
        </div>
      </section>
    </SiteShell>
  );
}

function Stat({ i: Icon, n, l, c, isString }: { i: any; n: number | string; l: string; c: string; isString?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <Icon className={"h-6 w-6 " + c} />
      <div className={"mt-4 font-bold " + (isString ? "text-2xl" : "text-3xl")}>{n}</div>
      <div className="text-sm text-muted-foreground">{l}</div>
    </div>
  );
}
