import { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getServerSession } from '@elsesourav/auth';
import { CreateTicketForm } from '@/features/support/components/CreateTicketForm';
import { Card, Button } from '@elsesourav/ui';
import { LifeBuoy, Headphones, MessageSquare, ArrowRight, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Engineering & Technical Support | ElseSourav',
  description: 'Submit an issue, bug report, or technical question to the ElseSourav engineering team.',
  openGraph: {
    title: 'Technical Support | ElseSourav',
    description: 'Open a support ticket with the ElseSourav engineering team.',
    type: 'website',
  },
};

export default async function SupportPage() {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });

  const isAuthenticated = Boolean(session?.user);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 text-xs font-medium">
            <Headphones className="w-3.5 h-3.5" />
            <span>Technical Support Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            How can our engineers assist you?
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Submit a bug report, troubleshooting inquiry, or account assistance request directly to our developer team.
          </p>

          {isAuthenticated && (
            <div className="pt-2">
              <Link href="/support/tickets">
                <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-300 text-xs gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> View My Existing Tickets
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Support Ticket Submission Card */}
        <div className="max-w-2xl mx-auto">
          {isAuthenticated ? (
            <Card className="p-6 sm:p-8 rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm shadow-2xl">
              <div className="mb-6 space-y-1 pb-4 border-b border-zinc-800/60">
                <h2 className="text-lg font-bold text-zinc-100">Create Support Ticket</h2>
                <p className="text-xs text-zinc-400">
                  Our engineering team aims to review and reply to all tickets promptly.
                </p>
              </div>

              <CreateTicketForm />
            </Card>
          ) : (
            <Card className="p-8 text-center rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm space-y-5 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-zinc-100">Sign in to Submit a Ticket</h2>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Support tickets are linked directly to your authenticated user account so you can track responses and maintain conversation history.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link href="/login?next=/support" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl gap-1.5 shadow-lg shadow-indigo-600/20">
                    <span>Sign In to Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <Link href="/help" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs gap-1.5">
                    <LifeBuoy className="w-3.5 h-3.5" /> Browse Help Center
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>

        {/* Knowledge Base Callout */}
        <Card className="p-6 rounded-2xl border-zinc-800/80 bg-zinc-900/20 backdrop-blur-sm max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-200">Looking for immediate answers?</h3>
              <p className="text-[11px] text-zinc-400">
                Explore our Knowledge Base for troubleshooting steps and setup guides.
              </p>
            </div>
          </div>

          <Link href="/help" className="shrink-0">
            <Button variant="outline" size="sm" className="text-xs border-zinc-800 text-zinc-300 gap-1">
              <span>Help Center</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
