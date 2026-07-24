import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Copy, Droplet } from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/stores/cartStore";

export const Route = createFileRoute("/order/$number")({
  head: () => ({ meta: [{ title: "Order confirmation | Sujala" }] }),
  component: OrderPage,
});

function OrderPage() {
  const { number } = Route.useParams();
  const order = useQuery({
    queryKey: ["order", number],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_order_by_number", { _order_number: number });
      if (error) throw error;
      return (data as any[])?.[0] ?? null;
    },
  });
  const bank = useQuery({
    queryKey: ["payment-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("payment_settings").select("*").limit(1).maybeSingle();
      return data;
    },
  });

  if (order.isLoading) return <SiteShell><div className="mx-auto max-w-3xl px-4 py-24 text-center">Loading…</div></SiteShell>;
  if (!order.data) return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl font-bold">Order not found</h1>
        <Button asChild className="mt-6"><Link to="/products">Continue shopping</Link></Button>
      </div>
    </SiteShell>
  );

  const o = order.data;
  const items = Array.isArray(o.items) ? (o.items as any[]) : [];

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h1 className="mt-6 text-3xl font-bold">Thank you, {o.customer_name}!</h1>
          <p className="mt-2 text-muted-foreground">Your order has been received. We'll call you soon to confirm delivery.</p>

          <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3 shadow-card">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Order number</div>
              <div className="text-xl font-bold text-primary">{o.order_number}</div>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(o.order_number); toast.success("Copied"); }}
              className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-secondary" aria-label="Copy">
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>

        {o.payment_method === "bank_transfer" && bank.data && (
          <div className="mt-8 rounded-2xl border-2 border-primary/30 bg-primary/5 p-6">
            <div className="font-semibold text-primary">Please complete your bank transfer of {formatINR(Number(o.subtotal))}</div>
            <dl className="mt-3 grid gap-1.5 text-sm text-muted-foreground [&_dt]:font-medium [&_dt]:text-foreground">
              {bank.data.upi_id && <Row dt="UPI ID" dd={bank.data.upi_id} />}
              {bank.data.account_name && <Row dt="Account name" dd={bank.data.account_name} />}
              {bank.data.bank_name && <Row dt="Bank" dd={bank.data.bank_name} />}
              {bank.data.account_number && <Row dt="Account #" dd={bank.data.account_number} />}
              {bank.data.ifsc && <Row dt="IFSC" dd={bank.data.ifsc} />}
            </dl>
            {bank.data.instructions && <p className="mt-3 text-xs text-muted-foreground">{bank.data.instructions}</p>}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="border-b border-border p-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Items</div>
            <ul className="mt-3 space-y-3">
              {items.map((i, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-secondary/40 grid place-items-center">
                    {i.image ? <img src={i.image} alt={i.name} className="h-full w-full object-cover" /> : <Droplet className="h-5 w-5 text-primary/40" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{i.name}</div>
                    <div className="text-xs text-muted-foreground">Qty {i.quantity}</div>
                  </div>
                  <div className="text-sm font-semibold">{formatINR(Number(i.line_total ?? i.price * i.quantity))}</div>
                </li>
              ))}
            </ul>
          </div>
          <dl className="grid gap-2 p-5 text-sm">
            <Row dt="Payment" dd={o.payment_method === "cod" ? "Cash on Delivery" : "Bank Transfer"} />
            <Row dt="Status" dd={String(o.status)} />
            <Row dt="Payment status" dd={String(o.payment_status).replace(/_/g, " ")} />
            <Row dt="Placed" dd={new Date(o.created_at).toLocaleString()} />
            <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
              <dt className="text-base font-semibold">Total</dt>
              <dd className="text-xl font-bold text-primary">{formatINR(Number(o.subtotal))}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline"><Link to="/products">Continue shopping</Link></Button>
          <Button asChild><Link to="/dashboard">View my orders</Link></Button>
        </div>
      </div>
    </SiteShell>
  );
}
function Row({ dt, dd }: { dt: string; dd: string }) {
  return <div className="flex items-center justify-between gap-4"><dt className="font-medium text-foreground">{dt}</dt><dd className="capitalize text-muted-foreground">{dd}</dd></div>;
}
