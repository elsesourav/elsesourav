import { HelpSidebar } from "@/components/help/HelpSidebar";
import { fetchServiceData } from "@/lib/service-client";
import { ReactNode, Suspense } from "react";

export default async function HelpLayout({
  children,
}: {
  children: ReactNode;
}) {
  const tree = await fetchServiceData<any[]>({
    service: "content",
    path: "/v1/content/help/tree",
  }).catch(() => []);

  return (
    <div className="mx-auto flex w-full max-w-360 flex-col md:flex-row md:gap-12 px-4 py-8 sm:px-6 lg:px-8">
      {/* Sticky Docs Sidebar */}
      <Suspense fallback={<div className="w-64 p-4">Loading menu...</div>}>
        <HelpSidebar tree={tree} />
      </Suspense>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 max-w-4xl pt-2">{children}</main>
    </div>
  );
}
