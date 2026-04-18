import { PageHeader, PageShell } from "@/components/ui/page";

const legalCardClassName =
  "space-y-4 rounded-xl border border-black/10 bg-white p-5 text-sm leading-7 text-[#1f2633]";
const legalUpdatedClassName =
  "border-t border-black/10 pt-3 text-xs font-medium tracking-wide text-[#5b6476]";

export const metadata = {
  title: "Refund Policy",
  description: "Refund eligibility and processing expectations for paid apps.",
};

export default function RefundPolicyPage() {
  return (
    <PageShell width="content" className="gap-8">
      <PageHeader
        eyebrow="Legal"
        title="Refund Policy"
        description="Refund terms for paid products distributed through ElseSourav."
      />

      <section className={legalCardClassName}>
        <p>
          Refund requests are typically accepted within 7 days of purchase if
          the product is materially different from the listing.
        </p>
        <p>
          Requests are reviewed within 3 business days. Approved refunds are
          processed to the original payment method.
        </p>
        <p>
          To request a refund, contact support with your order details and issue
          summary.
        </p>
        <p className={legalUpdatedClassName}>Last updated: March 30, 2026.</p>
      </section>
    </PageShell>
  );
}
