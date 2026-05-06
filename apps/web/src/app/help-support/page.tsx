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
  const [categories, articles] = await Promise.all([
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
  ]);

  const featuredArticle = articles[0] ?? null;

  return (
    <PageShell width="content" className="gap-8 py-10">
      <HelpSupportHero />

      <PageHeader
        eyebrow="Support"
        title="Start here"
        description="Choose the fastest path for answers, guides, and support tickets."
      />

      <HelpSupportPaths />

      <HelpSupportForm />

      <HelpSupportArticles
        featuredArticle={featuredArticle}
        categories={categories}
        articles={articles}
      />
    </PageShell>
  );
}
