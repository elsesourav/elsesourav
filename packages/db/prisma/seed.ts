import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import {
  AppStatus,
  BannerPlacement,
  BlogPostStatus,
  ContentStatus,
  HelpArticleStatus,
  PrismaClient,
  Role,
  SliderType,
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

    const starterTag = await prisma.appTag.upsert({
      where: { slug: "starter" },
      update: {
        name: "Starter",
      },
      create: {
        name: "Starter",
        slug: "starter",
      },
    });

    await prisma.appTagOnApp.upsert({
      where: {
        appId_tagId: {
          appId: starterApp.id,
          tagId: starterTag.id,
        },
      },
      update: {},
      create: {
        appId: starterApp.id,
        tagId: starterTag.id,
      },
    });

    const existingSlider = await prisma.homeSlider.findFirst({
      where: {
        title: "Build Faster With ElseSourav",
        type: SliderType.HERO,
      },
      select: { id: true },
    });

    if (!existingSlider) {
      await prisma.homeSlider.create({
        data: {
          title: "Build Faster With ElseSourav",
          description:
            "Discover featured tools, upcoming releases, and curated developer workflows.",
          type: SliderType.HERO,
          appId: starterApp.id,
          orderIndex: 0,
          isActive: true,
          createdBy: admin.id,
          updatedBy: admin.id,
        },
      });
    }

    await prisma.appAggregateStat.upsert({
      where: { appId: starterApp.id },
      update: {
        viewCount: 0,
        downloadCount: 0,
        libraryCount: 0,
        feedbackCount: 0,
        averageRating: 0,
      },
      create: {
        appId: starterApp.id,
        viewCount: 0,
        downloadCount: 0,
        libraryCount: 0,
        feedbackCount: 0,
        averageRating: 0,
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

  await prisma.profilePage.upsert({
    where: { slug: "main" },
    update: {
      fullName: "Else Sourav",
      headline: "Full-Stack Developer & Product Builder",
      shortBio:
        "I build practical software products with strong service architecture.",
      bioMarkdown:
        "I enjoy shipping reliable backend systems and polished user experiences. This platform shares my apps, articles, and product experiments.",
      experienceMarkdown:
        "- Building full-stack web products\n- Designing microservice APIs\n- Scaling developer workflows",
      skills: ["TypeScript", "Next.js", "Node.js", "Prisma", "PostgreSQL"],
      tools: ["VS Code", "GitHub Actions", "Docker", "Cloudinary"],
      contactEmail: admin.email,
      githubUrl: "https://github.com",
      linkedinUrl: "https://www.linkedin.com",
      websiteUrl: "https://elsesourav.com",
      isActive: true,
      updatedBy: admin.id,
    },
    create: {
      slug: "main",
      fullName: "Else Sourav",
      headline: "Full-Stack Developer & Product Builder",
      shortBio:
        "I build practical software products with strong service architecture.",
      bioMarkdown:
        "I enjoy shipping reliable backend systems and polished user experiences. This platform shares my apps, articles, and product experiments.",
      experienceMarkdown:
        "- Building full-stack web products\n- Designing microservice APIs\n- Scaling developer workflows",
      skills: ["TypeScript", "Next.js", "Node.js", "Prisma", "PostgreSQL"],
      tools: ["VS Code", "GitHub Actions", "Docker", "Cloudinary"],
      contactEmail: admin.email,
      githubUrl: "https://github.com",
      linkedinUrl: "https://www.linkedin.com",
      websiteUrl: "https://elsesourav.com",
      isActive: true,
      createdBy: admin.id,
      updatedBy: admin.id,
    },
  });

  const engineeringTag = await prisma.blogTag.upsert({
    where: { slug: "engineering" },
    update: {
      name: "Engineering",
    },
    create: {
      name: "Engineering",
      slug: "engineering",
    },
  });

  await prisma.blogPost.upsert({
    where: { slug: "welcome-to-the-platform" },
    update: {
      title: "Welcome to the Platform",
      excerpt:
        "How the services-first architecture powers apps, content, and user flows.",
      contentMarkdown:
        "This is the first blog post on the platform. It explains the architecture and what to expect next.",
      status: BlogPostStatus.PUBLISHED,
      publishAt: new Date(),
      publishedAt: new Date(),
      authorId: admin.id,
      updatedBy: admin.id,
      tags: {
        deleteMany: {},
        create: [{ tagId: engineeringTag.id }],
      },
    },
    create: {
      slug: "welcome-to-the-platform",
      title: "Welcome to the Platform",
      excerpt:
        "How the services-first architecture powers apps, content, and user flows.",
      contentMarkdown:
        "This is the first blog post on the platform. It explains the architecture and what to expect next.",
      status: BlogPostStatus.PUBLISHED,
      publishAt: new Date(),
      publishedAt: new Date(),
      authorId: admin.id,
      createdBy: admin.id,
      updatedBy: admin.id,
      tags: {
        create: [{ tagId: engineeringTag.id }],
      },
    },
  });

  const helpCategory = await prisma.helpCategory.upsert({
    where: { slug: "getting-started" },
    update: {
      name: "Getting Started",
      description: "Start here for account, app, and troubleshooting basics.",
      orderIndex: 0,
      isActive: true,
    },
    create: {
      name: "Getting Started",
      slug: "getting-started",
      description: "Start here for account, app, and troubleshooting basics.",
      orderIndex: 0,
      isActive: true,
    },
  });

  await prisma.helpArticle.upsert({
    where: { slug: "installing-apps" },
    update: {
      categoryId: helpCategory.id,
      title: "Installing Apps",
      summary: "How to install and track apps from the catalog.",
      contentMarkdown:
        "Browse apps, open the app details page, and choose the correct platform link. Your downloads and views are tracked automatically.",
      status: HelpArticleStatus.PUBLISHED,
      isFeatured: true,
      publishAt: new Date(),
      publishedAt: new Date(),
      updatedBy: admin.id,
    },
    create: {
      categoryId: helpCategory.id,
      slug: "installing-apps",
      title: "Installing Apps",
      summary: "How to install and track apps from the catalog.",
      contentMarkdown:
        "Browse apps, open the app details page, and choose the correct platform link. Your downloads and views are tracked automatically.",
      status: HelpArticleStatus.PUBLISHED,
      isFeatured: true,
      publishAt: new Date(),
      publishedAt: new Date(),
      createdBy: admin.id,
      updatedBy: admin.id,
    },
  });

  const existingTestimonial = await prisma.testimonial.findFirst({
    where: {
      authorName: "Early Platform User",
      company: "Community",
    },
    select: { id: true },
  });

  if (!existingTestimonial) {
    await prisma.testimonial.create({
      data: {
        authorName: "Early Platform User",
        authorRole: "Developer",
        company: "Community",
        quoteMarkdown:
          "The platform is fast, clean, and makes discovering useful tools very easy.",
        rating: 5,
        sortOrder: 0,
        isFeatured: true,
        isActive: true,
        createdBy: admin.id,
        updatedBy: admin.id,
      },
    });
  }

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
