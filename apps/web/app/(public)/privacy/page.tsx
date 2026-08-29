import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@elsesourav/ui';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import { Shield, ArrowLeft, Lock, Eye, Database } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Understand how ElseSourav handles data, security, and privacy across our developer tools and web ecosystem.',
  alternates: {
    canonical: 'https://elsesourav.com/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | ElseSourav',
    description: 'Learn about data privacy, telemetry policies, and security on ElseSourav.',
    url: 'https://elsesourav.com/privacy',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | ElseSourav',
    description: 'Learn about data privacy and security on ElseSourav.',
  },
};

export default function PrivacyPage() {
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <Shield className="w-3.5 h-3.5" />
            <span>Data Protection & Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-zinc-400">
            Last revised: August 29, 2026. Effective for all ElseSourav applications, services, and
            web tools.
          </p>
        </div>

        {/* Policy Content */}
        <div className="space-y-6">
          <Card className="p-6 sm:p-8 rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm space-y-6">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-400" /> 1. Commitment to User Privacy
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                ElseSourav (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;platform&rdquo;) develops
                high-performance developer software, web applications, and technical content. We
                prioritize minimal data collection, transparency, and strict protection of your
                information.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Eye className="w-5 h-5 text-cyan-400" /> 2. Information We Collect
              </h2>
              <ul className="text-sm text-zinc-300 space-y-2 list-disc list-inside">
                <li>
                  <strong className="text-zinc-100">Account Information:</strong> When you register
                  via Supabase Auth, we store your email, username, and authentication identifiers.
                </li>
                <li>
                  <strong className="text-zinc-100">Support Interactions:</strong> Inquiries,
                  tickets, and feedback submitted through our support desk.
                </li>
                <li>
                  <strong className="text-zinc-100">Anonymous Telemetry:</strong> Aggregated,
                  non-identifiable usage statistics to optimize low-latency performance and diagnose
                  errors.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" /> 3. Data Storage & Security
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Your data is stored in PostgreSQL databases protected by role-based access controls
                (RBAC) and row-level security (RLS). We never sell, monetize, or transfer your
                personal data to third-party advertising networks.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-zinc-100">4. Your Rights & Account Deletion</h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                You retain full ownership of your data. You may update your profile information,
                manage communication preferences, or request full account deletion at any time via
                your{' '}
                <Link href={ROUTES.SETTINGS} className="text-indigo-400 hover:underline">
                  Account Settings
                </Link>
                .
              </p>
            </section>
          </Card>
        </div>
      </div>
    </div>
  );
}
