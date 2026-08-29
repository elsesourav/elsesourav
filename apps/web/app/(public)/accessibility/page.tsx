import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@elsesourav/ui';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import { Eye, ArrowLeft, CheckCircle, Keyboard, Contrast } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description:
    'ElseSourav commitment to digital accessibility, inclusive design standards, WCAG 2.1 AA conformance, and screen reader compatibility.',
  alternates: {
    canonical: 'https://elsesourav.com/accessibility',
  },
  openGraph: {
    title: 'Accessibility Statement | ElseSourav',
    description: 'Learn about our commitment to accessible and inclusive web software.',
    url: 'https://elsesourav.com/accessibility',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Accessibility Statement | ElseSourav',
    description: 'Learn about accessibility standards on ElseSourav.',
  },
};

export default function AccessibilityPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Accessibility Statement | ElseSourav',
    description: 'ElseSourav digital accessibility statement and standards.',
    url: 'https://elsesourav.com/accessibility',
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <Link
          href={ROUTES.HOME}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-medium">
            <Eye className="w-3.5 h-3.5" />
            <span>Inclusive Engineering</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            Accessibility Statement
          </h1>
          <p className="text-sm text-zinc-400">
            Our ongoing commitment to ensuring digital accessibility for all developers, users, and
            assistive technologies.
          </p>
        </div>

        {/* Accessibility Content */}
        <Card className="p-6 sm:p-8 rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" /> 1. Conformance Standards
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              ElseSourav is committed to making our applications accessible to people with
              disabilities. We continually improve the user experience and apply relevant
              accessibility standards, striving to adhere to the Web Content Accessibility
              Guidelines (WCAG) 2.1 Level AA.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-indigo-400" /> 2. Keyboard & Screen Reader
              Navigation
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              All core interactive components—including navigation menus, dialogs, form controls,
              search bars, and application cards—are engineered with proper ARIA attributes,
              semantic HTML landmarks, and full keyboard focus indicators.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Contrast className="w-5 h-5 text-cyan-400" /> 3. High Contrast & Motion Preferences
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Our design tokens adhere to strict contrast ratios across dark mode surfaces.
              Hardware-accelerated animations respect the{' '}
              <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-200">
                prefers-reduced-motion
              </code>{' '}
              media query to prevent discomfort for sensitive users.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-100">4. Feedback & Support</h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              If you encounter an accessibility barrier or require assistance, please reach out to
              our team via the{' '}
              <Link href={ROUTES.SUPPORT} className="text-indigo-400 hover:underline">
                Support Portal
              </Link>
              .
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
}
