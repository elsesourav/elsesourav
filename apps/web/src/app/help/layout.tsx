import { ReactNode } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { fetchServiceData } from "@/lib/service-client";

export default async function HelpLayout({ children }: { children: ReactNode }) {
  const categories = await fetchServiceData<any[]>({
    service: "content",
    path: "/v1/content/help/categories",
  }).catch(() => []);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col md:flex-row md:gap-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Sticky Docs Sidebar */}
      <aside className="hidden md:block w-64 shrink-0">
        <div className="sticky top-24 space-y-6">
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search docs... (Cmd+K)" 
              className="w-full pl-9 pr-4 py-2 text-sm bg-surface-elevated border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-shadow"
            />
          </div>

          <nav className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Getting Started
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/help" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                    Help Center Home
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Categories
              </h3>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/help?categorySlug=${cat.slug}`} className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Support
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/contact" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                    Contact Support
                  </Link>
                </li>
                <li>
                  <Link href="/help/faqs" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                    Browse FAQs
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
