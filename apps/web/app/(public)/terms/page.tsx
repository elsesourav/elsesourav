import { Metadata } from 'next';
import Link from 'next/link';
import { PageShell, Card } from '@elsesourav/ui';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import { Scale, ArrowLeft } from 'lucide-react';
import { AdminRepository } from '@elsesourav/database';
import { buildPageMetadata } from '@/lib/seo-metadata';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { DEFAULT_TERMS_OF_SERVICE_MD } from '@/lib/legal-defaults';

export const metadata: Metadata = buildPageMetadata({
  title: 'Terms of Service',
  description:
    'Terms and conditions governing the use of ElseSourav applications, software products, and web services.',
  path: '/terms',
});

export default async function TermsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms of Service | ElseSourav',
    description: 'Terms and conditions governing the use of ElseSourav software.',
    url: 'https://elsesourav.com/terms',
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
  };

  // Load from database, fall back to default
  let termsContent = DEFAULT_TERMS_OF_SERVICE_MD;
  try {
    const adminRepo = new AdminRepository();
    const settings = await adminRepo.getAllSettings();
    if (settings['legal_terms_md']?.trim()) {
      termsContent = settings['legal_terms_md'];
    }
  } catch {
    // Silently fall back to default content
  }

  return (
    <PageShell size="lg" glow>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href={ROUTES.HOME}
          className="inline-flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
            <Scale className="w-3.5 h-3.5" />
            <span>Legal & Software Terms</span>
          </div>
        </div>

        {/* Dynamic Markdown Content */}
        <Card className="p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl">
          <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-[hsl(var(--foreground))] prose-p:text-[hsl(var(--muted-foreground))] prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-strong:text-[hsl(var(--foreground))] prose-li:text-[hsl(var(--muted-foreground))] prose-th:text-[hsl(var(--foreground))] prose-td:text-[hsl(var(--muted-foreground))]">
            <MarkdownRenderer content={termsContent} />
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
