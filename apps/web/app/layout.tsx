import type { Metadata, Viewport } from 'next';
import { Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import '@elsesourav/ui/styles.css';
import { SITE_CONFIG } from '@elsesourav/config';
import { ToastProvider, SkipLink } from '@elsesourav/ui';
import { ThemeScript } from '@/components/theme/ThemeScript';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { DevHmrControl } from '@/components/dev/DevHmrControl';
import { PageTransitionLoader } from '@/components/loading/PageTransitionLoader';
import { SiteService } from '@elsesourav/database';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const siteService = new SiteService();
  const identity = await siteService.getSiteAndCreatorIdentity().catch(() => null);

  const siteName = identity?.site.name || SITE_CONFIG.name;
  const siteTagline = identity?.site.tagline || SITE_CONFIG.tagline;
  const siteDescription = identity?.site.description || SITE_CONFIG.description;
  const siteLogo = identity?.site.logoUrl || '/logo.png';
  const siteOgImage = identity?.site.ogImageUrl || SITE_CONFIG.ogImage;

  const dynamicFavicon = identity?.site.logoUrl || '/favicon.ico';

  return {
    title: {
      default: `${siteName} — ${siteTagline}`,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    metadataBase: new URL(SITE_CONFIG.url),
    icons: {
      icon: [
        { url: dynamicFavicon, sizes: 'any' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      ],
      shortcut: dynamicFavicon,
      apple: [{ url: siteLogo || '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    manifest: '/manifest.webmanifest',
    openGraph: {
      title: `${siteName} — ${siteTagline}`,
      description: siteDescription,
      url: SITE_CONFIG.url,
      siteName,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: siteOgImage,
          width: 1024,
          height: 576,
          alt: `${siteName} — ${siteTagline}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description: siteDescription,
      images: [siteOgImage],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteService = new SiteService();
  const identity = await siteService.getSiteAndCreatorIdentity().catch(() => null);
  const effectsLevel = identity?.site.effectsLevel || 'high';

  return (
    <html
      lang="en"
      data-effects={effectsLevel}
      className={`${plusJakartaSans.variable} ${outfit.variable} ${jetbrainsMono.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <ThemeScript initialEffects={effectsLevel} />
        <DevHmrControl />
      </head>
      <body className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))] min-h-screen antialiased selection:bg-indigo-600/30 selection:text-indigo-200 font-sans">
        <SkipLink targetId="main-content" />
        <ThemeProvider initialEffects={effectsLevel}>
          <PageTransitionLoader
            siteName={identity?.site.name}
            logoUrl={identity?.site.logoUrl}
            logoPixelsJson={identity?.site.logoPixelsJson}
          />
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
