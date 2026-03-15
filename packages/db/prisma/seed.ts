import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import {
  AppStatus,
  BannerPlacement,
  ContentStatus,
  PrismaClient,
  Role,
  StoreSectionType,
} from "../src/generated/prisma/client";

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to run db seed.");
  }

  return databaseUrl;
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: getDatabaseUrl() }),
});

const defaultCategories = [
  { name: "Chrome Extensions", icon: "Puzzle" },
  { name: "Android Apps", icon: "Smartphone" },
  { name: "Developer Tools", icon: "Wrench" },
  { name: "Scripts", icon: "Terminal" },
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "change-this-password";

  if (adminPassword.length < 10) {
    throw new Error(
      "ADMIN_PASSWORD must be at least 10 characters for seeding.",
    );
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: Role.ADMIN,
      passwordHash,
      name: "Platform Admin",
    },
    create: {
      email: adminEmail,
      role: Role.ADMIN,
      passwordHash,
      name: "Platform Admin",
    },
  });

  const categories = await Promise.all(
    defaultCategories.map((category) =>
      prisma.category.upsert({
        where: { name: category.name },
        update: { icon: category.icon },
        create: category,
      }),
    ),
  );

  const existingAppCount = await prisma.app.count();
  const firstCategory = categories.at(0);

  if (existingAppCount === 0 && firstCategory) {
    await prisma.app.create({
      data: {
        title: "Starter Dev Toolkit",
        slug: "starter-dev-toolkit",
        shortDescription:
          "A starter toolkit app for validating listing, media, and links.",
        fullDescription:
          "This seeded app helps validate your public catalog, app detail page, and download tracking flow while implementation is in progress.",
        version: "1.0.0",
        status: AppStatus.PUBLISHED,
        publishedAt: new Date(),
        isPaid: false,
        price: 0,
        categoryId: firstCategory.id,
        createdById: admin.id,
        links: {
          create: [
            {
              platform: "GITHUB",
              downloadUrl: "https://github.com",
              sourceCodeUrl: "https://github.com",
            },
          ],
        },
      },
    });
  }

  const starterApp = await prisma.app.findUnique({
    where: { slug: "starter-dev-toolkit" },
    select: { id: true },
  });

  if (starterApp) {
    await prisma.storeSectionItem.upsert({
      where: {
        appId_sectionType: {
          appId: starterApp.id,
          sectionType: StoreSectionType.LATEST,
        },
      },
      update: {
        orderIndex: 1,
        releaseAt: new Date(),
      },
      create: {
        appId: starterApp.id,
        sectionType: StoreSectionType.LATEST,
        orderIndex: 1,
        releaseAt: new Date(),
      },
    });

    await prisma.storeSectionItem.upsert({
      where: {
        appId_sectionType: {
          appId: starterApp.id,
          sectionType: StoreSectionType.UPCOMING,
        },
      },
      update: {
        orderIndex: 1,
        releaseAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      create: {
        appId: starterApp.id,
        sectionType: StoreSectionType.UPCOMING,
        orderIndex: 1,
        releaseAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  const existingBanner = await prisma.storeBanner.findFirst({
    where: {
      placement: BannerPlacement.HOME_HERO,
      title: "ElseSourav Store Highlights",
    },
    select: { id: true },
  });

  if (!existingBanner) {
    await prisma.storeBanner.create({
      data: {
        title: "ElseSourav Store Highlights",
        imageUrl:
          "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
        linkUrl: null,
        placement: BannerPlacement.HOME_HERO,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdBy: admin.id,
        updatedBy: admin.id,
      },
    });
  }

  await prisma.contentPage.upsert({
    where: { slug: "about" },
    update: {
      title: "About ElseSourav",
      summary: "Dynamic platform profile page.",
      body: "ElseSourav is a developer platform that combines a portfolio, app discovery, and an admin-managed store experience.",
      seoTitle: "About ElseSourav",
      seoDescription:
        "Learn about the platform vision and development direction.",
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      publishAt: new Date(),
      updatedBy: admin.id,
    },
    create: {
      slug: "about",
      title: "About ElseSourav",
      summary: "Dynamic platform profile page.",
      body: "ElseSourav is a developer platform that combines a portfolio, app discovery, and an admin-managed store experience.",
      seoTitle: "About ElseSourav",
      seoDescription:
        "Learn about the platform vision and development direction.",
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      publishAt: new Date(),
      createdBy: admin.id,
      updatedBy: admin.id,
      versions: {
        create: {
          version: 1,
          title: "About ElseSourav",
          summary: "Dynamic platform profile page.",
          body: "ElseSourav is a developer platform that combines a portfolio, app discovery, and an admin-managed store experience.",
          seoTitle: "About ElseSourav",
          seoDescription:
            "Learn about the platform vision and development direction.",
          status: ContentStatus.PUBLISHED,
          createdBy: admin.id,
        },
      },
    },
  });

  await prisma.themeConfig.upsert({
    where: { name: "Default Brand Theme" },
    update: {
      isActive: true,
      primaryColor: "#1f2937",
      secondaryColor: "#111827",
      accentColor: "#f59e0b",
      backgroundColor: "#ffffff",
      foregroundColor: "#111827",
      fontSans: "Inter",
      fontHeading: "Poppins",
      headingScale: "1.10",
      updatedBy: admin.id,
    },
    create: {
      name: "Default Brand Theme",
      isActive: true,
      primaryColor: "#1f2937",
      secondaryColor: "#111827",
      accentColor: "#f59e0b",
      backgroundColor: "#ffffff",
      foregroundColor: "#111827",
      fontSans: "Inter",
      fontHeading: "Poppins",
      headingScale: "1.10",
      createdBy: admin.id,
      updatedBy: admin.id,
    },
  });

  console.log("Seed complete. Admin user and default categories are ready.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
