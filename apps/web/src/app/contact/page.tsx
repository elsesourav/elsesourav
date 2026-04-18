import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageHeader, PageShell } from "@/components/ui/page";

export const metadata = {
  title: "Contact",
  description:
    "Contact ElseSourav for product, support, and business inquiries.",
};

export default function ContactPage() {
  return (
    <PageShell width="content" className="gap-8">
      <PageHeader
        eyebrow="Contact"
        title="Get in touch"
        description="For support, partnerships, and product questions, use the channels below."
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <Card className="space-y-2">
          <CardTitle>General inquiries</CardTitle>
          <CardDescription>support@elsesourav.dev</CardDescription>
        </Card>
        <Card className="space-y-2">
          <CardTitle>Security reports</CardTitle>
          <CardDescription>security@elsesourav.dev</CardDescription>
        </Card>
        <Card className="space-y-2">
          <CardTitle>Business inquiries</CardTitle>
          <CardDescription>business@elsesourav.dev</CardDescription>
        </Card>
      </section>

      <p className="ui-text-muted text-sm">
        Typical response window: 1-2 business days.
      </p>
    </PageShell>
  );
}
