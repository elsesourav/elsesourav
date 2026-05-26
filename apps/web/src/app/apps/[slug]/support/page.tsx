import { PageHeader, PageShell } from "@/components/ui/page";
import { fetchServiceData } from "@/lib/service-client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ExternalLink, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AppSupportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // 1. Fetch App details
  const app = await fetchServiceData<any>({
    service: "catalog",
    path: `/v1/catalog/apps/${slug}`,
  }).catch(() => null);

  if (!app) {
    notFound();
  }

  // 2. Fetch FAQs & Articles for this app
  const [faqs, helpArticles] = await Promise.all([
    fetchServiceData<any[]>({
      service: "content",
      path: `/v1/content/help/faqs?appId=${app.id}`,
    }).catch(() => []),
    fetchServiceData<any>({
      service: "content",
      path: `/v1/content/help/articles?limit=10`,
    }).then(res => res.items?.filter((a: any) => a.appId === app.id) || []).catch(() => []),
  ]);

  return (
    <PageShell width="content" className="gap-8">
      
      <nav className="flex items-center text-sm font-medium text-text-muted space-x-2">
        <Link href={`/apps/${app.slug}`} className="hover:text-text-primary transition-colors">{app.title}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-text-primary">Support</span>
      </nav>

      <PageHeader
        eyebrow="App Support"
        title={`${app.title} Support Hub`}
        description="Troubleshooting, FAQs, and contact information."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Docs & FAQs */}
        <div className="lg:col-span-2 space-y-8">
          
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-text-heading">Frequently Asked Questions</h2>
            {faqs.length === 0 ? (
              <p className="text-sm text-text-muted">No FAQs available for this app.</p>
            ) : (
              <div className="space-y-3">
                {faqs.map(faq => (
                  <div key={faq.id} className="ui-card p-4 rounded-xl border">
                    <h3 className="font-semibold text-text-primary mb-2">{faq.question}</h3>
                    <div className="text-sm text-text-secondary line-clamp-2 prose prose-sm dark:prose-invert">
                       {/* Note: this would be rendered as markdown in a real app */}
                       {faq.answerMdx}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-text-heading">Help Articles</h2>
            {helpArticles.length === 0 ? (
              <p className="text-sm text-text-muted">No help articles available.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {helpArticles.map((article: any) => (
                  <Link key={article.id} href={`/help/${article.slug}`}>
                    <div className="ui-card h-full p-4 rounded-xl border hover:border-brand-primary/50 hover:shadow-sm transition-all group">
                      <h3 className="font-semibold text-text-primary group-hover:text-brand-primary mb-1">
                        {article.title}
                      </h3>
                      <p className="text-xs text-text-muted line-clamp-2">
                        {article.summary}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Right Col: Contact & Meta */}
        <div className="space-y-6">
          <div className="ui-card p-5 rounded-xl border bg-surface-elevated/50 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-2">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-text-heading text-lg">Still need help?</h3>
            <p className="text-sm text-text-muted">Our support team is here to assist you with any issues.</p>
            <Button className="w-full" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>

          <div className="ui-card p-5 rounded-xl border space-y-3">
            <h3 className="font-semibold text-text-heading mb-4">App Resources</h3>
            
            {app.supportEmail && (
              <div className="flex justify-between items-center py-2 border-b text-sm">
                <span className="text-text-muted">Email</span>
                <a href={`mailto:${app.supportEmail}`} className="font-medium hover:text-brand-primary transition-colors">
                  {app.supportEmail}
                </a>
              </div>
            )}
            
            {app.supportWebsiteUrl && (
              <div className="flex justify-between items-center py-2 border-b text-sm">
                <span className="text-text-muted">Website</span>
                <a href={app.supportWebsiteUrl} target="_blank" rel="noreferrer" className="font-medium flex items-center hover:text-brand-primary transition-colors">
                  Visit Site <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            )}
            
            <div className="flex justify-between items-center py-2 text-sm">
              <span className="text-text-muted">Version</span>
              <span className="font-medium">{app.version}</span>
            </div>
          </div>
        </div>

      </div>
    </PageShell>
  );
}
