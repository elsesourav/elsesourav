import { PageHeader } from "@/components/ui/page";
import Link from "next/link";
import { headers } from "next/headers";

export default function AdminHelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 p-4 sm:p-5 lg:p-6">
      <PageHeader
        eyebrow="Documentation"
        title="Help Center"
        description="Manage your enterprise Help Center and documentation."
      />

      <div className="flex gap-4 border-b pb-2">
        <Link
          href="/admin/help/articles"
          className="text-sm font-medium hover:text-brand-primary transition-colors"
        >
          Articles
        </Link>
        <Link
          href="/admin/help/categories"
          className="text-sm font-medium hover:text-brand-primary transition-colors"
        >
          Categories
        </Link>
        <Link
          href="/admin/help/images"
          className="text-sm font-medium hover:text-brand-primary transition-colors"
        >
          Images
        </Link>
      </div>

      <div>{children}</div>
    </div>
  );
}
