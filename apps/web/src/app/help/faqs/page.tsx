import { fetchServiceData } from "@/lib/service-client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MarkdownContent } from "@/components/ui/markdown-content";

type FAQ = {
  id: string;
  question: string;
  answerMdx: string;
  category?: {
    name: string;
  };
};

export const metadata = {
  title: "Frequently Asked Questions | Help Center",
  description: "Browse frequently asked questions and get quick answers.",
};

export const dynamic = "force-dynamic";

export default async function HelpFAQsPage() {
  const faqs = await fetchServiceData<FAQ[]>({
    service: "content",
    path: "/v1/content/help/faqs",
  }).catch(() => []);

  return (
    <div className="space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm font-medium text-text-muted space-x-2">
        <Link href="/help" className="hover:text-text-primary transition-colors">Help Center</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-text-primary">FAQs</span>
      </nav>

      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-heading sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-text-muted max-w-2xl">
          Quick answers to common questions about our platform and services.
        </p>
      </div>

      <div className="space-y-6">
        {faqs.length === 0 ? (
          <div className="ui-card p-12 text-center text-text-muted rounded-2xl border">
            No FAQs available at the moment.
          </div>
        ) : (
          <div className="grid gap-6">
            {faqs.map((faq) => (
              <div key={faq.id} className="ui-card rounded-2xl border p-6 hover:border-brand-primary/50 transition-colors shadow-sm">
                <h3 className="text-lg font-semibold text-text-heading mb-3 flex items-start gap-2">
                  <span className="text-brand-primary font-bold">Q:</span>
                  {faq.question}
                </h3>
                <div className="text-text-secondary leading-relaxed bg-surface-active/30 p-4 rounded-xl border border-border-subtle prose prose-sm dark:prose-invert max-w-none">
                  <MarkdownContent markdown={faq.answerMdx} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
