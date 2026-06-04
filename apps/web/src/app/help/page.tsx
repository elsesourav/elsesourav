import { MarkdownContent } from "@/components/ui/markdown-content";
import { fetchServiceData } from "@/lib/service-client";
import { formatDateTime } from "@/lib/view-models";

export const metadata = {
  title: "Help Center",
  description: "Find guides, troubleshooting steps, and feature documentation.",
};

export const dynamic = "force-dynamic";

export default async function HelpPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  
  const tree = await fetchServiceData<any[]>({
    service: "content",
    path: "/v1/content/help/tree",
  }).catch(() => []);

  if (!tree || tree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h1 className="text-3xl font-bold text-text-heading mb-4">Help Center</h1>
        <p className="text-text-secondary text-lg">No content available yet.</p>
      </div>
    );
  }

  const selectedCategorySlug = params.category || tree[0]?.slug;
  const category = tree.find((c) => c.slug === selectedCategorySlug) || tree[0];

  return (
    <div className="flex flex-col gap-16 relative pb-24">
      <section key={category.id} id={category.slug} className="scroll-mt-32">
        <div className="mb-8">
          <h2 className="text-4xl font-extrabold tracking-tight text-text-heading mb-2">
            {category.name}
          </h2>
          {category.description && (
            <p className="text-text-secondary text-lg">{category.description}</p>
          )}
        </div>
        
        <div className="space-y-16">
          {category.articles?.map((article: any) => (
            <article key={article.id} id={article.slug} className="scroll-mt-32">
              <header className="space-y-4 mb-8">
                <h3 className="text-3xl font-bold text-text-primary tracking-tight">
                  {article.title}
                </h3>
                {article.summary && (
                  <p className="text-xl text-text-secondary leading-relaxed">
                    {article.summary}
                  </p>
                )}
                {article.publishedAt && (
                  <div className="flex items-center gap-4 text-sm font-medium text-text-muted">
                    <span>Updated {formatDateTime(article.updatedAt)}</span>
                    {article.readingTimeMins > 0 && (
                      <span>• {article.readingTimeMins} min read</span>
                    )}
                  </div>
                )}
              </header>

              <div className="prose prose-brand max-w-none">
                <MarkdownContent markdown={article.contentMdx || article.contentMarkdown} />
              </div>
              
              {article.sections?.map((section: any) => (
                <div key={section.id} id={`${article.slug}-${section.slug}`} className="mt-8 scroll-mt-32">
                  <h4 className="text-2xl font-semibold mb-4">{section.title}</h4>
                  <div className="prose prose-brand max-w-none">
                    <MarkdownContent markdown={section.contentMarkdown} />
                  </div>
                </div>
              ))}
              
              <hr className="mt-16 border-border-subtle" />
            </article>
          ))}
        </div>
        
        {category.children?.map((childCategory: any) => (
           <div key={childCategory.id} id={childCategory.slug} className="scroll-mt-32 mt-16">
             <h3 className="text-3xl font-bold text-text-heading mb-8">
               {childCategory.name}
             </h3>
             <div className="space-y-16">
              {childCategory.articles?.map((article: any) => (
                <article key={article.id} id={article.slug} className="scroll-mt-32">
                  <header className="space-y-4 mb-8">
                    <h4 className="text-2xl font-bold text-text-primary">
                      {article.title}
                    </h4>
                    {article.summary && (
                      <p className="text-lg text-text-secondary">
                        {article.summary}
                      </p>
                    )}
                  </header>
                  <div className="prose prose-brand max-w-none">
                    <MarkdownContent markdown={article.contentMdx || article.contentMarkdown} />
                  </div>
                </article>
              ))}
             </div>
           </div>
        ))}
      </section>
    </div>
  );
}
