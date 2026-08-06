import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Mail, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Sujala Water Solutions" },
      {
        name: "description",
        content: "Read the Sujala Water Solutions privacy policy covering account, order, service, and complaint information.",
      },
      { property: "og:title", content: "Privacy Policy | Sujala Water Solutions" },
      {
        property: "og:description",
        content: "How Sujala Water Solutions collects, uses, protects, and retains customer information.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <SiteShell>
      <section className="border-b border-border bg-gradient-soft">
        <div className="mx-auto max-w-5xl px-4 py-16 md:px-6">
          <div className="flex items-center gap-3 text-primary">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-widest">Your privacy matters</span>
          </div>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Privacy Policy</h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            This policy explains how Sujala Water Solutions handles information when you use our website,
            place an order, book a service, or raise a complaint.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">Effective date: August 6, 2026</p>
        </div>
      </section>

      <article className="mx-auto max-w-5xl px-4 py-14 md:px-6">
        <div className="space-y-10 text-sm leading-7 text-muted-foreground">
          <PolicySection title="1. Information we collect">
            <p>We may collect information you provide directly, including your name, email address, phone number, delivery or service address, PIN code, order details, and messages submitted through complaints or support forms.</p>
            <p>When you create an account, we use your sign-in information and profile details to provide customer features such as order history, complaint tracking, and service updates.</p>
            <p>For bank-transfer orders, you may provide payment reference details. We do not ask for or store your card PIN, banking password, or one-time passwords.</p>
          </PolicySection>

          <PolicySection title="2. How we use information">
            <ul className="list-disc space-y-2 pl-5">
              <li>Process and deliver product orders and service bookings.</li>
              <li>Respond to complaints, support requests, and enquiries.</li>
              <li>Send essential updates about orders, appointments, complaints, and account activity.</li>
              <li>Maintain website security, prevent misuse, and improve our services.</li>
              <li>Meet legal, accounting, and regulatory requirements when applicable.</li>
            </ul>
          </PolicySection>

          <PolicySection title="3. When information is shared">
            <p>We share information only when needed to operate the service, such as with delivery, installation, repair, hosting, authentication, notification, and payment-service providers. These providers may process information only to perform the service they provide.</p>
            <p>We may also disclose information when required by law, to protect users and our business, or with your permission. We do not sell your personal information.</p>
          </PolicySection>

          <PolicySection title="4. Cookies and similar technology">
            <p>Our website may use essential browser storage and similar technology to keep you signed in, remember your cart, protect sessions, and make the website function. You can manage cookies through your browser settings, but some features may not work correctly if essential storage is blocked.</p>
          </PolicySection>

          <PolicySection title="5. Data security and retention">
            <p>We use reasonable technical and organisational safeguards designed to protect information from unauthorised access, loss, misuse, or alteration. No online service can guarantee absolute security.</p>
            <p>We keep information for as long as needed to provide the service, complete transactions, resolve complaints, meet legal obligations, and protect legitimate business interests. When it is no longer needed, we delete or anonymise it where reasonably possible.</p>
          </PolicySection>

          <PolicySection title="6. Your choices and rights">
            <p>You may ask us to access, correct, or delete personal information we hold about you, subject to legal and operational requirements. You may also contact us about an essential notification you believe is inaccurate or unnecessary.</p>
            <p>To make a request, contact us using the details below. We may need to verify your identity before completing a request.</p>
          </PolicySection>

          <PolicySection title="7. Children’s privacy">
            <p>Our services are intended for adults and households, not for children under 13. We do not knowingly collect personal information from children under 13.</p>
          </PolicySection>

          <PolicySection title="8. Changes to this policy">
            <p>We may update this policy when our services or legal requirements change. The updated version will be posted on this page with a revised effective date.</p>
          </PolicySection>

          <section className="border-t border-border pt-8">
            <h2 className="text-2xl font-bold text-foreground">9. Contact us</h2>
            <p className="mt-3">For privacy questions or requests, contact Sujala Water Solutions:</p>
            <a className="mt-4 inline-flex items-center gap-2 font-semibold text-primary hover:underline" href="mailto:sujalawatersolutions@gmail.com">
              <Mail className="h-4 w-4" aria-hidden="true" /> sujalawatersolutions@gmail.com
            </a>
            <p className="mt-2">Phone: +91 9949792248</p>
          </section>
        </div>
      </article>
    </SiteShell>
  );
}

function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
