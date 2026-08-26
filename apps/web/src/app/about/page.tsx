import { MarkdownContent } from "@/components/ui/markdown-content";
import { PageHeader, PageShell } from "@/components/ui/page";
import { CompositeHeroCanvas } from "@/features/about-canvas";
import { prisma } from "@elsesourav/db";
import type { ApiResponse, ContentPageDto } from "@elsesourav/types";

export const dynamic = "force-dynamic";

function AboutFallback({ message }: { message: string }) {
  return (
    <PageShell className="gap-6">
      <PageHeader
        eyebrow="Dynamic Content"
        title="About"
        description={message}
      />
    </PageShell>
  );
}

export default async function AboutPage() {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const profileImage = await prisma.imageConfig.findFirst({
    where: {
      section: "ABOUT_PROFILE",
      isActive: true,
    },
  });

  const nameLogo = await prisma.imageConfig.findFirst({
    where: {
      section: "ABOUT_NAME_LOGO",
      isActive: true,
    },
  });

  const socialLinks = await prisma.socialLink.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  const response = await fetch(`${baseUrl}/api/content/about`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return (
      <AboutFallback message="Content is not published yet. Use admin content manager to publish this page." />
    );
  }

  const payload = (await response.json()) as ApiResponse<ContentPageDto>;

  if (!payload.ok) {
    return <AboutFallback message="Failed to load content." />;
  }

  return (
    <PageShell className="gap-8 lg:gap-16">
      {/* Hero Section: Wrapped in CompositeHeroCanvas for unified WebGL particle effect */}
      <CompositeHeroCanvas chunkSize={1} alphaThreshold={20}>
        <div className="flex flex-col lg:flex-row gap-10 items-center lg:items-start pt-2 md:pt-3 min-h-[500px]">
          {/* Text Content */}
          <div className="flex-1 flex flex-col gap-6 order-2 my-auto lg:order-2 text-center lg:text-left pb-0 lg:pb-6 relative z-10">
            <div className="flex flex-col gap-2 items-center lg:items-start">
              <span className="text-2xl md:text-4xl font-semibold text-text-muted tracking-widest">
                Hello, I&apos;m
              </span>
              <h1 className="sr-only">Sourav Barui</h1>
              <div className="w-full max-w-125 md:max-w-175 lg:max-w-200">
                {/* 
                  Using a standard img tag here instead of Next.js Image because Next.js Image 
                  sometimes creates complex wrapper divs and we need direct access to the image 
                  for the canvas composite.
                */}
                <img
                  src={nameLogo?.url || "/img/sourav-barui.png"}
                  alt="Sourav Barui"
                  crossOrigin="anonymous"
                  className="w-full h-auto object-contain canvas-image-source"
                />
              </div>
            </div>

            {payload.data.summary ? (
              <div className="text-lg md:text-xl text-text-muted leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {payload.data.summary}
              </div>
            ) : null}

            {/* Social Links List */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start mt-2 md:mt-6">
              {socialLinks.map((social: any) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-border-subtle bg-surface-base hover:border-brand-primary hover:shadow-md transition-all duration-300 overflow-hidden relative z-20"
                  title={social.platform}
                >
                  <img
                    src={social.iconUrl || ""}
                    alt={social.platform}
                    loading="lazy"
                    crossOrigin="anonymous"
                    className="size-full object-contain canvas-image-source"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Profile Image Area */}
          {profileImage ? (
            <div className="w-full max-w-100 sm:max-w-125 lg:w-150 shrink-0 order-1 lg:order-1 flex justify-center lg:justify-start relative z-10">
              <div className="relative w-full aspect-3/4 flex items-center justify-center">
                <img
                  src={profileImage.url}
                  alt="Profile"
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover rounded-2xl canvas-image-source"
                />
              </div>
            </div>
          ) : null}
        </div>
      </CompositeHeroCanvas>

      {/* Main Body Content */}
      <article className="ui-card rounded-xl border p-5 md:p-8 leading-7 ui-text-primary shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)] mt-4">
        <MarkdownContent markdown={payload.data.body} />
      </article>
    </PageShell>
  );
}
