import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, ShieldOff } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin/payment")({
  head: () => ({ meta: [{ title: "Payment settings | Sujala Admin" }] }),
  component: Gate,
});

function Gate() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) { setIsAdmin(false); return; }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", userRes.user.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!data);
    })();
  }, []);
  if (isAdmin === null) return <SiteShell><div className="mx-auto max-w-3xl px-4 py-16">Checking permissions…</div></SiteShell>;
  if (!isAdmin) return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-destructive/10"><ShieldOff className="h-8 w-8 text-destructive" /></div>
        <h1 className="mt-6 text-3xl font-bold">Admins only</h1>
        <Button asChild className="mt-6"><Link to="/dashboard">Back to dashboard</Link></Button>
      </div>
    </SiteShell>
  );
  return <PaymentAdmin />;
}

function PaymentAdmin() {
  const qc = useQueryClient();
  const settings = useQuery({
    queryKey: ["payment-settings-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payment_settings").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({
    bank_name: "", account_name: "", account_number: "", ifsc: "", upi_id: "", instructions: "",
  });
  useEffect(() => {
    if (settings.data) {
      setForm({
        bank_name: settings.data.bank_name ?? "",
        account_name: settings.data.account_name ?? "",
        account_number: settings.data.account_number ?? "",
        ifsc: settings.data.ifsc ?? "",
        upi_id: settings.data.upi_id ?? "",
        instructions: settings.data.instructions ?? "",
      });
    }
  }, [settings.data]);

  const save = useMutation({
    mutationFn: async () => {
      if (settings.data) {
        const { error } = await supabase.from("payment_settings").update(form).eq("id", settings.data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("payment_settings").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("Payment details saved"); qc.invalidateQueries({ queryKey: ["payment-settings-admin"] }); qc.invalidateQueries({ queryKey: ["payment-settings"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <SiteShell>
      <section className="border-b border-border bg-gradient-soft">
        <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
          <Link to="/admin" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to admin
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Bank & UPI details</h1>
          <p className="text-sm text-muted-foreground">These details are shown to customers who choose Bank Transfer at checkout.</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="grid gap-4">
            <div><Label>UPI ID</Label><Input value={form.upi_id} onChange={(e) => setForm({ ...form, upi_id: e.target.value })} placeholder="name@upi" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Account name</Label><Input value={form.account_name} onChange={(e) => setForm({ ...form, account_name: e.target.value })} /></div>
              <div><Label>Bank name</Label><Input value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Account number</Label><Input value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} /></div>
              <div><Label>IFSC</Label><Input value={form.ifsc} onChange={(e) => setForm({ ...form, ifsc: e.target.value.toUpperCase() })} /></div>
            </div>
            <div><Label>Instructions to customer</Label><Textarea rows={3} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="e.g. After transfer, share the transaction reference on WhatsApp." /></div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save details"}
            </Button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
