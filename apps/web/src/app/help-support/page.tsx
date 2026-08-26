import { HelpSupportArticles } from "@/components/help-support/help-support-articles";
import { HelpSupportForm } from "@/components/help-support/help-support-form";
import { HelpSupportHero } from "@/components/help-support/help-support-hero";
import { HelpSupportPaths } from "@/components/help-support/help-support-paths";
import type {
  HelpArticle,
  HelpCategory,
} from "@/components/help-support/types";
import { PageHeader, PageShell } from "@/components/ui/page";
import { fetchServiceData } from "@/lib/service-client";

import Image from "next/image";

export const metadata = {
  title: "Help & Support",
  description: "Get fast help for accounts, apps, and billing in one place.",
};

export const dynamic = "force-dynamic";

type HelpArticleListResult = {
  items: HelpArticle[];
  pagination: {
    limit: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
};

export default async function HelpSupportPage() {
  const [categories, articles, activeImages] = await Promise.all([
    fetchServiceData<HelpCategory[]>({
      service: "content",
      path: "/v1/content/help/categories",
    }).catch(() => []),
    fetchServiceData<HelpArticleListResult>({
      service: "content",
      path: "/v1/content/help/articles?limit=24",
    })
      .then((payload) => payload.items)
      .catch(() => []),
    fetchServiceData<any>({
      service: "theme",
      path: "/v1/theme/active-images",
    }).catch(() => null),
  ]);

  const featuredArticle = articles[0] ?? null;
  const helpSupportConfig = activeImages?.HELP_SUPPORT;
  const bgImage = helpSupportConfig?.url || "/img/help-support.png";
  const heroTitle = helpSupportConfig?.metadata?.title;
  const heroSubtitle = helpSupportConfig?.metadata?.subtitle;

  return (
    <div className="relative min-h-screen">
      <div className="relative mx-auto w-full lg:w-3/4 h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden bg-brand-primary/5">
        <Image
          src={bgImage}
          alt="Help and Support Background"
          fill
          className="object-cover object-top opacity-60 dark:opacity-50"
          priority
          unoptimized={bgImage.includes("cloudinary.com")}
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/10 to-background" />
        <HelpSupportHero title={heroTitle} subtitle={heroSubtitle} />
      </div>

      <PageShell width="content" className="gap-8 py-10 md:py-16 relative z-10">
        <PageHeader eyebrow="Support" title="Start here" />

        <HelpSupportPaths />

        <HelpSupportForm />

        <HelpSupportArticles
          featuredArticle={featuredArticle}
          categories={categories}
          articles={articles}
        />
      </PageShell>
    </div>
  );
}
