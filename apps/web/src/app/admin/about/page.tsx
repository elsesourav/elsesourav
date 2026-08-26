import { PageHeader } from "@/components/ui/page";
import { requireAdminContext } from "@/lib/page-access";
import { prisma } from "@elsesourav/db";
import { AdminAboutClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  await requireAdminContext();

  const [aboutProfileConfigs, aboutNameLogoConfigs, aboutPage, socialLinks] = await Promise.all([
    prisma.imageConfig.findMany({
      where: { section: "ABOUT_PROFILE" },
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.imageConfig.findMany({
      where: { section: "ABOUT_NAME_LOGO" },
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.contentPage.findUnique({
      where: { slug: "about" },
    }),
    prisma.socialLink.findMany({
      orderBy: { order: "asc" },
    }),
  ]);

  const initialData = {
    aboutProfileConfigs,
    aboutNameLogoConfigs,
    summary: aboutPage?.summary || "",
    body: aboutPage?.body || "",
    socialLinks: socialLinks || [],
  };

  return (
    <div className="space-y-4 p-4 sm:p-5 lg:p-6">
      <PageHeader
        eyebrow="Content"
        title="About Page Settings"
        description="Configure the profile images, summary, and social links displayed on the About page."
      />

      <AdminAboutClient initialData={initialData} />
    </div>
  );
}
