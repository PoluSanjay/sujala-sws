import { createFileRoute } from "@tanstack/react-router";
import { Mail, UserRoundX } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/delete-account")({
  head: () => ({
    meta: [
      { title: "Delete Account | Sujala Water Solutions" },
      {
        name: "description",
        content: "Request deletion of your Sujala Water Solutions account and associated personal data.",
      },
      { property: "og:title", content: "Delete Account | Sujala Water Solutions" },
      {
        property: "og:description",
        content: "Learn how to request deletion of your Sujala Water Solutions account and personal data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DeleteAccountPage,
});

function DeleteAccountPage() {
  return (
    <SiteShell>
      <section className="border-b border-border bg-gradient-soft">
        <div className="mx-auto max-w-5xl px-4 py-16 md:px-6">
          <div className="flex items-center gap-3 text-primary">
            <UserRoundX className="h-6 w-6" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-widest">Account controls</span>
          </div>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Delete your account</h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            You can request deletion of your Sujala Water Solutions account and associated personal data at any time.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-14 md:px-6">
        <div className="space-y-10 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-bold text-foreground">How to request deletion</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5">
              <li>Send an email to our support team from the email address connected to your account.</li>
              <li>Use the subject line “Account deletion request”.</li>
              <li>Include your name, registered email address, and phone number so we can verify the request.</li>
            </ol>
            <a
              className="mt-6 inline-flex items-center gap-2 font-semibold text-primary hover:underline"
              href="mailto:sujalawatersolutions@gmail.com?subject=Account%20deletion%20request"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              Email a deletion request
            </a>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">What will be deleted</h2>
            <p className="mt-3">
              We will delete or anonymise your account profile, contact details, saved addresses, complaint messages,
              and other personal data associated with your account where reasonably possible.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">What may be retained</h2>
            <p className="mt-3">
              We may retain limited order, payment, or support records when required for legal, accounting, fraud
              prevention, dispute resolution, or legitimate business purposes. Retained records are restricted and
              deleted when the applicable requirement ends.
            </p>
          </section>

          <section className="border-t border-border pt-8">
            <h2 className="text-2xl font-bold text-foreground">Need help?</h2>
            <p className="mt-3">
              We may ask for additional information to confirm that the request belongs to you. For questions, contact
              Sujala Water Solutions at +91 9949792248 or sujalawatersolutions@gmail.com.
            </p>
          </section>
        </div>
      </article>
    </SiteShell>
  );
}
