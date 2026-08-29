import * as React from 'react';
import Link from 'next/link';
import { Card, Button } from '@elsesourav/ui';
import { Headphones, ArrowRight } from 'lucide-react';

export function HelpSupportCTA() {
  return (
    <Card className="p-8 rounded-3xl border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-zinc-900/60 to-zinc-950/80 backdrop-blur-md shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-zinc-100">
              Still have questions or need technical support?
            </h3>
            <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
              If you can't find what you are looking for in our documentation, submit a support
              ticket and our engineering team will assist you.
            </p>
          </div>
        </div>

        <Link href="/support" className="shrink-0">
          <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl gap-1.5 shadow-lg shadow-indigo-600/20">
            <span>Open Support Ticket</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
