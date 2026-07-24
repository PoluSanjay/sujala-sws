import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Banknote, Droplet, Loader2, ShieldCheck, Truck, Wallet } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCartStore, formatINR } from "@/stores/cartStore";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | Sujala Water Solutions" },
      { name: "description", content: "Place your order with Cash on Delivery or Bank Transfer." },
    ],
  }),
  component: CheckoutPage,
});

const schema = z.object({
  customer_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(20),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  address: z.string().trim().min(5).max(500),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  pincode: z.string().trim().max(10).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  payment_method: z.enum(["cod", "bank_transfer"]),
});

function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const [submitting, setSubmitting] = useState(false);
  const [method, setMethod] = useState<"cod" | "bank_transfer">("cod");
  const [prefill, setPrefill] = useState<{ name: string; phone: string; email: string; user_id: string | null }>({ name: "", phone: "", email: "", user_id: null });

  const bank = useQuery({
    queryKey: ["payment-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("payment_settings").select("*").limit(1).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) return;
      const { data: profile } = await supabase.from("profiles").select("full_name, phone").eq("id", userRes.user.id).maybeSingle();
      setPrefill({
        name: profile?.full_name || "",
        phone: profile?.phone || "",
        email: userRes.user.email || "",
        user_id: userRes.user.id,
      });
    })();
  }, []);

  if (items.length === 0) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-secondary">
            <Droplet className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mt-6 text-3xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">Add products before proceeding to checkout.</p>
          <Button asChild className="mt-6"><Link to="/products">Browse products</Link></Button>
        </div>
      </SiteShell>
    );
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries()) as Record<string, string>;
    raw.payment_method = method;
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast.error(first?.message ?? "Please check the form");
      setSubmitting(false);
      return;
    }

    const orderItems = items.map((i) => ({
      product_id: i.productId,
      slug: i.slug,
      name: i.name,
      brand: i.brand,
      image: i.image,
      price: i.price,
      quantity: i.quantity,
      line_total: +(i.price * i.quantity).toFixed(2),
    }));

    const payload = {
      customer_name: parsed.data.customer_name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      address: parsed.data.address,
      city: parsed.data.city || null,
      pincode: parsed.data.pincode || null,
      notes: parsed.data.notes || null,
      items: orderItems,
      subtotal: +totalPrice.toFixed(2),
      payment_method: parsed.data.payment_method,
      payment_status: parsed.data.payment_method === "bank_transfer" ? "awaiting_verification" : "unpaid",
      user_id: prefill.user_id,
    } as const;

    const { data, error } = await supabase.from("orders").insert(payload).select("order_number").single();
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    clearCart();
    toast.success("Order placed!");
    navigate({ to: "/order/$number", params: { number: data.order_number } });
  };

  return (
    <SiteShell>
      <section className="border-b border-border bg-gradient-soft">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
          <Link to="/products" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-3.5 w-3.5" /> Continue shopping
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Checkout</h1>
        </div>
      </section>

      <form onSubmit={onSubmit} className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:px-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card title="Delivery details">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full name" required><Input name="customer_name" defaultValue={prefill.name} required maxLength={100} /></Field>
              <Field label="Phone" required><Input name="phone" defaultValue={prefill.phone} required maxLength={20} placeholder="+91 …" /></Field>
              <Field label="Email"><Input name="email" type="email" defaultValue={prefill.email} placeholder="you@example.com" /></Field>
              <Field label="City"><Input name="city" maxLength={100} placeholder="e.g. Hyderabad" /></Field>
              <Field label="Pincode"><Input name="pincode" maxLength={10} placeholder="500001" /></Field>
            </div>
            <Field label="Full address" required>
              <Textarea name="address" required rows={3} maxLength={500} placeholder="House / flat, area, landmark, city, state, pincode" />
            </Field>
            <Field label="Order notes (optional)">
              <Textarea name="notes" rows={2} maxLength={1000} placeholder="Preferred delivery time, special instructions…" />
            </Field>
          </Card>

          <Card title="Payment method">
            <div className="grid gap-3">
              <PayOption
                selected={method === "cod"} onSelect={() => setMethod("cod")}
                icon={Wallet} title="Cash on Delivery"
                subtitle="Pay in cash when the technician delivers or installs the product."
              />
              <PayOption
                selected={method === "bank_transfer"} onSelect={() => setMethod("bank_transfer")}
                icon={Banknote} title="Bank Transfer / UPI"
                subtitle="Transfer to our bank account or UPI, then share the reference number."
              />

              {method === "bank_transfer" && bank.data && (
                <div className="mt-2 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
                  <div className="mb-2 font-semibold text-primary">Payment details</div>
                  <dl className="grid gap-1.5 text-muted-foreground [&_dt]:font-medium [&_dt]:text-foreground">
                    {bank.data.upi_id && <Row dt="UPI ID" dd={bank.data.upi_id} />}
                    {bank.data.account_name && <Row dt="Account name" dd={bank.data.account_name} />}
                    {bank.data.bank_name && <Row dt="Bank" dd={bank.data.bank_name} />}
                    {bank.data.account_number && <Row dt="Account #" dd={bank.data.account_number} />}
                    {bank.data.ifsc && <Row dt="IFSC" dd={bank.data.ifsc} />}
                  </dl>
                  {bank.data.instructions && <p className="mt-3 text-xs italic text-muted-foreground">{bank.data.instructions}</p>}
                </div>
              )}
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card title="Order summary">
            <ul className="space-y-3">
              {items.map((i) => (
                <li key={i.productId} className="flex gap-3">
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-secondary/40 grid place-items-center">
                    {i.image ? <img src={i.image} alt={i.name} className="h-full w-full object-cover" /> : <Droplet className="h-5 w-5 text-primary/40" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{i.name}</div>
                    <div className="text-xs text-muted-foreground">Qty {i.quantity} × {formatINR(i.price)}</div>
                  </div>
                  <div className="text-sm font-semibold">{formatINR(i.price * i.quantity)}</div>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
              <SumRow label="Subtotal" value={formatINR(totalPrice)} />
              <SumRow label="Delivery" value="Free" />
              <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
                <span className="text-base font-semibold">Total</span>
                <span className="text-xl font-bold text-primary">{formatINR(totalPrice)}</span>
              </div>
            </div>
            <Button type="submit" size="lg" className="mt-4 w-full" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Place order"}
            </Button>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Free delivery</div>
              <div className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Warranty</div>
            </div>
          </Card>
        </aside>
      </form>
    </SiteShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm font-medium">{label}{required && <span className="ml-0.5 text-destructive">*</span>}</Label>
      {children}
    </div>
  );
}
function PayOption({ selected, onSelect, icon: Icon, title, subtitle }: { selected: boolean; onSelect: () => void; icon: any; title: string; subtitle: string }) {
  return (
    <button type="button" onClick={onSelect} className={"flex items-start gap-3 rounded-xl border p-4 text-left transition-all " + (selected ? "border-primary bg-primary/5 shadow-card" : "border-border bg-background hover:border-primary/40")}>
      <div className={"grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg " + (selected ? "bg-primary text-primary-foreground" : "bg-secondary text-primary")}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
      <div className={"ml-auto h-4 w-4 flex-shrink-0 rounded-full border-2 " + (selected ? "border-primary bg-primary" : "border-border")} />
    </button>
  );
}
function SumRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between"><span className="text-muted-foreground">{label}</span><span>{value}</span></div>;
}
function Row({ dt, dd }: { dt: string; dd: string }) {
  return <div className="flex items-center justify-between gap-4"><dt>{dt}</dt><dd className="font-mono">{dd}</dd></div>;
}
