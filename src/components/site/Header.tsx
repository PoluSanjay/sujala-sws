import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, Phone, User, X, LogOut, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.955L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/site/CartDrawer";
import type { User as SBUser } from "@supabase/supabase-js";
import swsLogo from "@/assets/sws-logo.png.asset.json";

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#4285F4" d="M22.5 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.9a5.05 5.05 0 0 1-2.19 3.31v2.75h3.54c2.07-1.91 3.25-4.72 3.25-8.07z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.68l-3.54-2.75c-.98.66-2.24 1.06-3.74 1.06-2.87 0-5.3-1.94-6.17-4.55H2.18v2.86A11 11 0 0 0 12 23z" />
    <path fill="#FBBC05" d="M5.83 14.08A6.6 6.6 0 0 1 5.46 12c0-.72.13-1.42.36-2.08V7.06H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.65-2.86z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.65l3.14-3.14C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.65 2.86C6.7 7.32 9.13 5.38 12 5.38z" />
  </svg>
);


const nav = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/services", label: "Services" },
  { to: "/complaints", label: "Complaints" },
  { to: "/track", label: "Track" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [user, setUser] = useState<SBUser | null>(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const signInWithGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (!result.redirected) {
      navigate({ to: "/dashboard" });
    }
  };


  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={swsLogo.url} alt="Sujala Water Solutions" className="h-11 w-11 rounded-full object-cover ring-1 ring-border" />
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-bold tracking-tight text-foreground">SWS</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Sujala Water Solutions
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "!text-primary bg-secondary" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="tel:+919949792248"
            className="hidden h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-primary md:flex"
            aria-label="Call Sujala Water Solutions"
            title="Call Sujala Water Solutions"
          >
            <Phone className="h-4 w-4" />
          </a>
          <a
            href="https://wa.me/919949792248"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-9 w-9 items-center justify-center rounded-md text-primary transition-colors hover:bg-secondary md:flex"
            aria-label="Chat on WhatsApp"
            title="Chat on WhatsApp"
          >
            <WhatsAppIcon className="h-4 w-4" />
          </a>
          <CartDrawer />
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard"><LayoutDashboard className="mr-1.5 h-4 w-4" />Dashboard</Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={signInWithGoogle} aria-label="Sign in with Google" title="Sign in with Google">
                  <GoogleIcon className="h-4 w-4" />
                </Button>
                <Button size="sm" asChild>
                  <Link to="/auth"><User className="mr-1.5 h-4 w-4" /> Sign in</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="ml-1 grid h-10 w-10 place-items-center rounded-md hover:bg-secondary lg:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background lg:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "!text-primary bg-secondary" }}
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t border-border pt-3">
              {user ? (
                <>
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={signOut}><LogOut className="h-4 w-4" /></Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={() => { void signInWithGoogle(); setOpen(false); }} className="flex-1">
                    <GoogleIcon className="mr-2 h-4 w-4" /> Google
                  </Button>
                  <Button size="sm" asChild className="flex-1">
                    <Link to="/auth" onClick={() => setOpen(false)}>Sign in</Link>
                  </Button>
                </>
              )}
            </div>
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              <div className="flex gap-2 px-3 py-2">
                <a
                  href="tel:+919949792248"
                  className="grid h-10 w-10 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-primary"
                  aria-label="Call Sujala Water Solutions"
                  title="Call Sujala Water Solutions"
                >
                  <Phone className="h-4 w-4" />
                </a>
                <a
                  href="https://wa.me/919949792248"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-10 w-10 place-items-center rounded-md text-primary hover:bg-secondary"
                  aria-label="Chat on WhatsApp"
                  title="Chat on WhatsApp"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
