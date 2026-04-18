import { PageHeader, PageShell } from "@/components/ui/page";

const legalCardClassName =
  "space-y-4 rounded-xl border border-black/10 bg-white p-5 text-sm leading-7 text-[#1f2633]";
const legalUpdatedClassName =
  "border-t border-black/10 pt-3 text-xs font-medium tracking-wide text-[#5b6476]";

export const metadata = {
  title: "Terms of Service",
  description: "Read the terms governing your use of ElseSourav Apps.",
};

export default function TermsPage() {
  return (
    <PageShell width="content" className="gap-8">
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        description="Rules and responsibilities for using the ElseSourav platform."
      />

      <section className={legalCardClassName}>
        <p>
          By using this platform, you agree to comply with all applicable laws
          and our acceptable-use policies.
        </p>
        <p>
          You are responsible for the security of your account credentials and
          activities performed under your account.
        </p>
        <p>
          Paid app access, if applicable, is governed by the listed pricing and
          refund policy.
        </p>
        <p className={legalUpdatedClassName}>Last updated: March 30, 2026.</p>
      </section>
    </PageShell>
  );
}
