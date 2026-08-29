import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@elsesourav/ui';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import { FileText, ArrowLeft, CheckCircle2, Scale, Terminal } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms and conditions governing the use of ElseSourav applications, software products, and web services.',
  alternates: {
    canonical: 'https://elsesourav.com/terms',
  },
  openGraph: {
    title: 'Terms of Service | ElseSourav',
    description: 'Read the terms of service and usage conditions for ElseSourav.',
    url: 'https://elsesourav.com/terms',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service | ElseSourav',
    description: 'Read the terms of service for ElseSourav software ecosystem.',
  },
};

export default function TermsPage() {
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 text-xs font-medium">
            <Scale className="w-3.5 h-3.5" />
            <span>Legal & Software Terms</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-zinc-400">
            Last revised: August 29, 2026. Please read these terms carefully before accessing
            ElseSourav.
          </p>
        </div>

        {/* Terms Content */}
        <Card className="p-6 sm:p-8 rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" /> 1. Acceptance of Terms
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              By accessing or using ElseSourav tools, software applications, or technical
              documentation, you agree to be bound by these Terms of Service. If you disagree with
              any part, you may not access our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" /> 2. Software Licensing & Permitted Use
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              ElseSourav grants you a personal, non-exclusive, revocable license to access our web
              applications and documentation in accordance with their designated license models
              (open source or proprietary).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> 3. User Conduct & Security
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              You agree not to exploit vulnerabilities, attempt unauthorized privilege escalation,
              reverse engineer closed-source modules, or disrupt server infrastructure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-100">4. Disclaimer of Warranties</h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              The services and applications are provided on an &ldquo;AS IS&rdquo; and &ldquo;AS
              AVAILABLE&rdquo; basis without warranties of any kind, either express or implied.
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
}
