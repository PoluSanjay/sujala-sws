import { Link } from "@tanstack/react-router";
import { Droplet, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link to="/" className="mb-4 flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-hero">
                <Droplet className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-[15px] font-bold">SWS</div>
                <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  Sujala Water Solutions
                </div>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              Better Service for Better Purification. Trusted RO purifier sales, installation,
              and service since day one.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary">About us</Link></li>
              <li><Link to="/services" className="hover:text-primary">Services</Link></li>
              <li><Link to="/products" className="hover:text-primary">Products</Link></li>
              <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/complaints" className="hover:text-primary">Raise a complaint</Link></li>
              <li><Link to="/track" className="hover:text-primary">Track complaint</Link></li>
              <li><Link to="/services" className="hover:text-primary">Book service</Link></li>
              <li><Link to="/auth" className="hover:text-primary">Customer login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Reach us</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 text-primary" /> +91 9949792248</li>
              <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 text-primary" /> care@sujala.in</li>
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary" /> Service in your city</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row">
          <div>© {new Date().getFullYear()} Sujala Water Solutions. All rights reserved.</div>
          <div>Better Service for Better Purification.</div>
        </div>
      </div>
    </footer>
  );
}
