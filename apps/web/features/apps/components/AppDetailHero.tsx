import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge, Button } from '@elsesourav/ui';
import { getAppIconUrl } from '@elsesourav/media';
import type { PublicApp, AppLink } from '@elsesourav/types';
import { Sparkles, ArrowUpRight, ArrowLeft, Globe } from 'lucide-react';
import { SaveAppButton } from './SaveAppButton';

interface AppDetailHeroProps {
  app: PublicApp;
}

export function AppDetailHero({ app }: AppDetailHeroProps) {
  const iconUrl = app.iconUrl ? getAppIconUrl(app.iconUrl, 160) : null;
  const primaryLink: AppLink | undefined = app.links.find((l) => l.isPrimary) || app.links[0];

  return (
    <div className="space-y-6">
      {/* Back Navigation Link */}
      <Link
        href="/apps"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to all applications</span>
      </Link>

      <div className="flex flex-col sm:flex-row items-start gap-6 p-6 sm:p-8 rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl">
        {/* App Icon */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700/60 shadow-2xl shrink-0 flex items-center justify-center">
          {iconUrl ? (
            <Image
              src={iconUrl}
              alt={`${app.name} icon`}
              width={112}
              height={112}
              priority
              className="w-full h-full object-cover"
            />
          ) : (
            <Sparkles className="w-12 h-12 text-indigo-400" />
          )}
        </div>

        {/* Info & Meta */}
        <div className="flex-1 space-y-4 min-w-0">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
                {app.name}
              </h1>

              {app.isFeatured && (
                <span className="text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 border border-amber-400/20">
                  <Sparkles className="w-3 h-3 fill-current" /> Featured
                </span>
              )}

              {app.currentVersion && (
                <Badge variant="outline" className="text-xs px-2 py-0.5 text-zinc-400 border-zinc-800 font-mono">
                  v{app.currentVersion}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Link href={`/apps?category=${app.categorySlug}`}>
                <Badge variant="info" className="text-xs hover:bg-indigo-900/60 transition-colors">
                  {app.primaryCategory}
                </Badge>
              </Link>

              {app.tags.map((tag) => (
                <Link key={tag} href={`/apps?tag=${tag}`}>
                  <span className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                    #{tag}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl">
            {app.shortDescription}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {primaryLink && (
              <a
                href={primaryLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 shadow-lg shadow-indigo-600/20 gap-2">
                  <span>{primaryLink.label || 'Launch Application'}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </a>
            )}

            {app.demoUrl && app.demoUrl !== primaryLink?.url && (
              <a href={app.demoUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm gap-1.5">
                  <Globe className="w-4 h-4" /> Live Demo
                </Button>
              </a>
            )}

            <SaveAppButton appId={app.id} appSlug={app.slug} />
          </div>
        </div>
      </div>
    </div>
  );
}
