import { useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes admins to realtime inserts on orders + complaints and pops a toast.
 * Also fires a browser Notification (if permitted) so admins are alerted even on other tabs.
 */
export function useAdminOrderNotifications() {
  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user || cancelled) return;
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userRes.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!role || cancelled) return;

      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
        try { Notification.requestPermission(); } catch { /* ignore */ }
      }

      const notify = (title: string, body: string) => {
        toast.success(title, { description: body, duration: 8000 });
        try {
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            new Notification(title, { body });
          }
        } catch { /* ignore */ }
      };

      channel = supabase
        .channel("admin-live-feed")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
          const o = payload.new as { order_number?: string; customer_name?: string; city?: string; subtotal?: number };
          notify(
            `New order ${o.order_number ?? ""}`.trim(),
            `${o.customer_name ?? "Customer"}${o.city ? ` — ${o.city}` : ""} • ₹${Number(o.subtotal ?? 0).toLocaleString("en-IN")}`,
          );
        })
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "complaints" }, (payload) => {
          const c = payload.new as { ticket_number?: string; name?: string; category?: string; priority?: string };
          notify(
            `New complaint ${c.ticket_number ?? ""}`.trim(),
            `${c.name ?? "Customer"} • ${c.category ?? ""}${c.priority && c.priority !== "normal" ? ` (${c.priority})` : ""}`,
          );
        })
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);
}
