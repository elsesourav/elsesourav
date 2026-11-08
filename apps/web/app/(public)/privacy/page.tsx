import { Metadata } from 'next';
import Link from 'next/link';
import { PageShell, Card } from '@elsesourav/ui';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import { Shield, ArrowLeft } from 'lucide-react';
import { AdminRepository } from '@elsesourav/database';
import { buildPageMetadata } from '@/lib/seo-metadata';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { DEFAULT_PRIVACY_POLICY_MD } from '@/lib/legal-defaults';

export const metadata: Metadata = buildPageMetadata({
  title: 'Privacy Policy',
  description:
    'Understand how ElseSourav handles data, security, and privacy across our developer tools and web ecosystem.',
  path: '/privacy',
});

export default async function PrivacyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy | ElseSourav',
    description: 'Privacy policy and data protection standards for ElseSourav.',
    url: 'https://elsesourav.com/privacy',
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
  };

  // Load from database, fall back to default
  let privacyContent = DEFAULT_PRIVACY_POLICY_MD;
  try {
    const adminRepo = new AdminRepository();
    const settings = await adminRepo.getAllSettings();
    if (settings['legal_privacy_md']?.trim()) {
      privacyContent = settings['legal_privacy_md'];
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <Shield className="w-3.5 h-3.5" />
            <span>Data Protection & Privacy</span>
          </div>
        </div>

        {/* Dynamic Markdown Content */}
        <Card className="p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl">
          <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-[hsl(var(--foreground))] prose-p:text-[hsl(var(--muted-foreground))] prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-strong:text-[hsl(var(--foreground))] prose-li:text-[hsl(var(--muted-foreground))] prose-th:text-[hsl(var(--foreground))] prose-td:text-[hsl(var(--muted-foreground))]">
            <MarkdownRenderer content={privacyContent} />
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
