import { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getServerSession } from '@elsesourav/auth';
import { CreateTicketForm } from '@/features/support/components/CreateTicketForm';
import { PageShell, PageHeader, Card, Button, Badge } from '@elsesourav/ui';
import { SITE_CONFIG } from '@elsesourav/config';
import { LifeBuoy, MessageSquare, ArrowRight, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Engineering & Technical Support Desk',
  description:
    'Submit an issue, bug report, or technical question directly to the ElseSourav engineering team.',
  alternates: {
    canonical: `${SITE_CONFIG.url}/support`,
  },
  openGraph: {
    title: `Engineering & Technical Support | ${SITE_CONFIG.name}`,
    description: 'Open a support ticket with the ElseSourav engineering team.',
    url: `${SITE_CONFIG.url}/support`,
    siteName: SITE_CONFIG.name,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: `Engineering & Technical Support | ${SITE_CONFIG.name}`,
    description: 'Open a support ticket with the ElseSourav engineering team.',
  },
};

export default async function SupportPage() {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });

  const isAuthenticated = Boolean(session?.user);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `${SITE_CONFIG.name} Technical Support`,
    description: 'Engineering support and priority issue desk for ElseSourav users.',
    url: `${SITE_CONFIG.url}/support`,
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
  };

  return (
    <PageShell size="lg" glow>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-12 max-w-4xl mx-auto">
        {/* Header Section */}
        <PageHeader
          eyebrow="Technical Assistance & Issue Desk"
          badge={
            <Badge variant="primary" className="text-xs px-2.5 py-0.5 font-medium">
              Direct Support
            </Badge>
          }
          title="Engineering & Technical Support"
          description="Submit a bug report, troubleshooting inquiry, or account assistance request directly to our developer team."
        />

        {/* Existing Tickets Shortcut for Authenticated Users */}
        {isAuthenticated && (
          <div className="flex justify-center -mt-6">
            <Link href="/support/tickets">
              <Button
                variant="outline"
                size="sm"
                className="border-border bg-card hover:bg-accent text-foreground text-xs gap-2 rounded-xl cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                <span>View My Existing Tickets</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
              </Button>
            </Link>
          </div>
        )}

        {/* Support Ticket Submission Card */}
        <div className="max-w-2xl mx-auto w-full">
          {isAuthenticated ? (
            <Card className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border bg-card text-card-foreground shadow-sm space-y-6">
              <div className="space-y-1 pb-4 border-b border-border">
                <h2 className="text-lg font-bold text-foreground">Create Support Ticket</h2>
                <p className="text-xs text-muted-foreground">
                  Our engineering team reviews and responds to all tickets directly through your
                  account.
                </p>
              </div>

              <CreateTicketForm />
            </Card>
          ) : (
            <Card className="p-8 text-center rounded-2xl sm:rounded-3xl border border-border bg-card text-card-foreground shadow-sm space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary shadow-sm">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">Sign in to Submit a Ticket</h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Support tickets are linked directly to your authenticated user account so you can
                  track responses and maintain conversation history.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link href="/login?next=/support" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto text-xs font-semibold px-5 py-2.5 rounded-xl gap-2 shadow-sm cursor-pointer">
                    <span>Sign In to Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <Link href="/help" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-border hover:bg-accent text-foreground text-xs gap-2 rounded-xl cursor-pointer"
                  >
                    <LifeBuoy className="w-3.5 h-3.5 text-primary" />
                    <span>Browse Help Center</span>
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>

        {/* Knowledge Base Help-First Callout */}
        <Card className="p-6 rounded-2xl border border-border bg-card text-card-foreground shadow-sm max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">Looking for immediate answers?</h3>
              <p className="text-[11px] text-muted-foreground">
                Explore our Knowledge Base for troubleshooting steps and setup guides.
              </p>
            </div>
          </div>

          <Link href="/help" className="shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-border text-foreground hover:bg-accent gap-1.5 rounded-xl cursor-pointer"
            >
              <span>Help Center</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
            </Button>
          </Link>
        </Card>
      </div>
    </PageShell>
  );
}
