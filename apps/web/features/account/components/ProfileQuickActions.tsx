'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { User as UserIcon, ShieldCheck, LifeBuoy, ArrowRight } from 'lucide-react';
import { useRipple } from '@/components/interior/Ripple';

const ACTIONS = [
  {
    title: 'Settings',
    subtitle: 'Update your avatar, display name, username, and public bio.',
    href: '/account?tab=settings',
    icon: UserIcon,
    iconColor: 'bg-primary/10 text-primary border-primary/20',
  },
  {
    title: 'Security',
    subtitle: 'Manage your email, password credentials, and session safety.',
    href: '/account?tab=security',
    icon: ShieldCheck,
    iconColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    title: 'Help & Support',
    subtitle: 'Get technical assistance, browse guides, or track support tickets.',
    href: '/support/tickets',
    icon: LifeBuoy,
    iconColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  },
] as const;

function ActionCard({ action }: { action: (typeof ACTIONS)[number] }) {
  const { bind, ripples, fadeDuration } = useRipple({ max: 3 });
  const reduced = useReducedMotion();
  const Icon = action.icon;

  return (
    <Link
      href={action.href}
      {...bind}
      className="group relative flex flex-col justify-between p-2.5 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl bg-card text-card-foreground border border-border/50 sm:border-border/80 shadow-xs sm:shadow-sm hover:border-primary/40 hover:shadow-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary overflow-hidden isolate"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      >
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="absolute block rounded-full bg-primary/15"
            style={{
              left: r.x - 48,
              top: r.y - 48,
              width: 96,
              height: 96,
              willChange: 'transform, opacity',
            }}
            initial={{ scale: reduced ? r.scale : 0, opacity: 0 }}
            animate={{ scale: r.scale, opacity: r.released ? 0 : 1 }}
            transition={{
              scale: reduced ? { duration: 0 } : { duration: 0.45, ease: [0.23, 1, 0.32, 1] },
              opacity: {
                duration: r.released ? fadeDuration : 0.07,
                ease: r.released ? [0.23, 1, 0.32, 1] : 'linear',
              },
            }}
          />
        ))}
      </span>

      <div className="space-y-2 sm:space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg sm:rounded-xl border flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${action.iconColor}`}
          >
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
        </div>

        <div className="space-y-0.5">
          <h3 className="font-semibold text-foreground text-xs sm:text-sm md:text-base group-hover:text-primary transition-colors">
            {action.title}
          </h3>
          <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
            {action.subtitle}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function ProfileQuickActions() {
  return (
    <div data-section="profile-actions" className="space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Account Actions
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5 md:gap-4">
        {ACTIONS.map((action) => (
          <ActionCard key={action.href} action={action} />
        ))}
      </div>
    </div>
  );
}
