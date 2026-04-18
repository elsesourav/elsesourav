import { PageHeader, PageShell } from "@/components/ui/page";

const legalCardClassName =
  "space-y-4 rounded-xl border border-black/10 bg-white p-5 text-sm leading-7 text-[#1f2633]";
const legalUpdatedClassName =
  "border-t border-black/10 pt-3 text-xs font-medium tracking-wide text-[#5b6476]";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Understand how ElseSourav collects, stores, and protects user data.",
};

export default function PrivacyPage() {
  return (
    <PageShell width="content" className="gap-8">
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description="How we collect, use, and protect your information on ElseSourav."
      />

      <section className={legalCardClassName}>
        <p>
          We collect account, usage, and device data required to operate this
          platform, improve reliability, and provide support.
        </p>
        <p>
          We only use data for product operations, security, analytics, billing
          where applicable, and legal compliance.
        </p>
        <p>
          You may request deletion of your account data from settings. Data
          retention follows security and legal obligations.
        </p>
        <p className={legalUpdatedClassName}>Last updated: March 30, 2026.</p>
      </section>
    </PageShell>
  );
}
