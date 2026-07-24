import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useAdminOrderNotifications } from "@/hooks/useAdminOrderNotifications";

export function SiteShell({ children }: { children: ReactNode }) {
  useAdminOrderNotifications();
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
