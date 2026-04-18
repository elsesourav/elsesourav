import { PageHeader, PageShell } from "@/components/ui/page";

const legalCardClassName =
  "space-y-4 rounded-xl border border-black/10 bg-white p-5 text-sm leading-7 text-[#1f2633]";
const legalUpdatedClassName =
  "border-t border-black/10 pt-3 text-xs font-medium tracking-wide text-[#5b6476]";

export const metadata = {
  title: "Cookie Policy",
  description: "Learn which cookies ElseSourav uses and why.",
};

export default function CookiesPage() {
  return (
    <PageShell width="content" className="gap-8">
      <PageHeader
        eyebrow="Legal"
        title="Cookie Policy"
        description="Cookie usage for security, session management, and product analytics."
      />

      <section className={legalCardClassName}>
        <p>
          Essential cookies are used for authentication, routing, and platform
          security.
        </p>
        <p>
          Optional analytics cookies may be used to understand feature usage and
          improve reliability.
        </p>
        <p>
          You can manage cookie preferences via your browser settings where
          available.
        </p>
        <p className={legalUpdatedClassName}>Last updated: March 30, 2026.</p>
      </section>
    </PageShell>
  );
}
