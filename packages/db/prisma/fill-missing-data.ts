/**
 * fill-missing-data.ts
 *
 * Fills NULL values in important database fields that should always have data.
 * Run with: npx tsx prisma/fill-missing-data.ts
 *
 * Fields filled:
 *   App.iconUrl         — generates a letter-avatar icon
 *   App.developerName   — defaults to "ElseSourav Labs"
 *   App.featureGraphicUrl — assigns a stock image
 *   Category.icon       — assigns a default icon name
 */

import { config as loadEnv } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(currentDir, "../../../.env") });
loadEnv({ path: resolve(currentDir, "../.env"), override: true });

import { PrismaPg } from "@prisma/adapter-pg";
import { AppType, PrismaClient } from "../src/generated/prisma/client";

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required.");
  }
  return url;
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: getDatabaseUrl() }),
});

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Stable colour palette for letter-avatars. */
const AVATAR_COLORS = [
  "4F46E5", // indigo
  "0891B2", // cyan
  "059669", // emerald
  "D97706", // amber
  "DC2626", // red
  "7C3AED", // violet
  "2563EB", // blue
  "DB2777", // pink
  "0D9488", // teal
  "EA580C", // orange
];

function pickColor(seed: string): string {
  let hash = 0;
  for (const ch of seed) {
    hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!;
}

function generateIconUrl(title: string): string {
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  const bg = pickColor(title);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=400&background=${bg}&color=fff&bold=true&format=png`;
}

/** Pool of high-quality Unsplash images for feature graphics. */
const FEATURE_GRAPHIC_POOL = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1400&q=80",
];

function pickFeatureGraphic(seed: string): string {
  let hash = 0;
  for (const ch of seed) {
    hash = (hash * 37 + ch.charCodeAt(0)) | 0;
  }
  return FEATURE_GRAPHIC_POOL[Math.abs(hash) % FEATURE_GRAPHIC_POOL.length]!;
}

const DEFAULT_DEVELOPER_NAME = "ElseSourav Labs";

const CATEGORY_ICON_MAP: Record<string, string> = {
  "Chrome Extensions": "Puzzle",
  "Android Apps": "Smartphone",
  "Developer Tools": "Wrench",
  Scripts: "Terminal",
};

/* ------------------------------------------------------------------ */
/*  Fill logic                                                         */
/* ------------------------------------------------------------------ */

async function fillApps() {
  console.log("\n── Filling App rows ──");

  const apps = await prisma.app.findMany({
    where: {
      OR: [
        { iconUrl: null },
        { iconUrl: "" },
        { developerName: null },
        { developerName: "" },
        { featureGraphicUrl: null },
        { featureGraphicUrl: "" },
      ],
    },
    select: { id: true, title: true, slug: true, iconUrl: true, developerName: true, featureGraphicUrl: true },
  });

  if (apps.length === 0) {
    console.log("  ✔ All apps already have iconUrl, developerName, and featureGraphicUrl.");
    return;
  }

  console.log(`  Found ${apps.length} app(s) with missing data.`);

  for (const app of apps) {
    const updates: Record<string, string> = {};

    if (!app.iconUrl || app.iconUrl.trim() === "") {
      updates.iconUrl = generateIconUrl(app.title);
    }

    if (!app.developerName || app.developerName.trim() === "") {
      updates.developerName = DEFAULT_DEVELOPER_NAME;
    }

    if (!app.featureGraphicUrl || app.featureGraphicUrl.trim() === "") {
      updates.featureGraphicUrl = pickFeatureGraphic(app.slug);
    }

    if (Object.keys(updates).length > 0) {
      await prisma.app.update({
        where: { id: app.id },
        data: updates,
      });
      console.log(`  ✔ ${app.title}: filled ${Object.keys(updates).join(", ")}`);
    }
  }
}

async function fillCategories() {
  console.log("\n── Filling Category rows ──");

  const categories = await prisma.category.findMany({
    where: {
      OR: [{ icon: null }, { icon: "" }],
    },
    select: { id: true, name: true, icon: true },
  });

  if (categories.length === 0) {
    console.log("  ✔ All categories already have an icon value.");
    return;
  }

  console.log(`  Found ${categories.length} category(ies) with missing icon.`);

  for (const category of categories) {
    const icon = CATEGORY_ICON_MAP[category.name] ?? "Package";
    await prisma.category.update({
      where: { id: category.id },
      data: { icon },
    });
    console.log(`  ✔ ${category.name}: set icon = "${icon}"`);
  }
}

async function fillAggregateStats() {
  console.log("\n── Filling AppAggregateStat rows ──");

  const appsWithoutStats = await prisma.app.findMany({
    where: {
      aggregateStat: null,
    },
    select: { id: true, title: true },
  });

  if (appsWithoutStats.length === 0) {
    console.log("  ✔ All apps have an aggregate stat row.");
    return;
  }

  console.log(`  Found ${appsWithoutStats.length} app(s) without aggregate stats.`);

  for (const app of appsWithoutStats) {
    // Generate somewhat realistic random stats
    const viewCount = Math.floor(Math.random() * 8000) + 200;
    const downloadCount = Math.floor(viewCount * (0.1 + Math.random() * 0.4));
    const libraryCount = Math.floor(downloadCount * (0.05 + Math.random() * 0.15));
    const feedbackCount = Math.floor(downloadCount * (0.02 + Math.random() * 0.08));
    const averageRating = (3.2 + Math.random() * 1.8).toFixed(2);

    await prisma.appAggregateStat.create({
      data: {
        appId: app.id,
        viewCount,
        downloadCount,
        libraryCount,
        feedbackCount,
        averageRating,
      },
    });
    console.log(
      `  ✔ ${app.title}: views=${viewCount}, downloads=${downloadCount}, rating=${averageRating}`,
    );
  }
}

/* ------------------------------------------------------------------ */
/*  Fill App type + appCategory from legacy Category model             */
/* ------------------------------------------------------------------ */

/** Maps existing Category.name → AppType enum */
const CATEGORY_TO_TYPE: Record<string, AppType> = {
  "Chrome Extensions": AppType.UTILITY_TOOL,
  "Android Apps": AppType.LIFESTYLE,
  "Developer Tools": AppType.PRODUCTIVITY_BUSINESS,
  Scripts: AppType.UTILITY_TOOL,
};

/** Maps existing Category.name → a human-readable sub-category string */
const CATEGORY_TO_SUBCATEGORY: Record<string, string> = {
  "Chrome Extensions": "Browser Extension",
  "Android Apps": "Mobile App",
  "Developer Tools": "Dev Tooling",
  Scripts: "Automation Script",
};

async function fillAppTypes() {
  console.log("\n── Filling App type + appCategory ──");

  const apps = await prisma.app.findMany({
    where: {
      OR: [
        { type: AppType.UTILITY_TOOL, appCategory: "" },
        { appCategory: "" },
      ],
    },
    select: {
      id: true,
      title: true,
      category: { select: { name: true } },
    },
  });

  if (apps.length === 0) {
    console.log("  ✔ All apps already have type + appCategory populated.");
    return;
  }

  console.log(`  Found ${apps.length} app(s) needing type/appCategory.`);

  for (const app of apps) {
    const catName = app.category?.name ?? "";
    const type = CATEGORY_TO_TYPE[catName] ?? AppType.UTILITY_TOOL;
    const appCategory = (CATEGORY_TO_SUBCATEGORY[catName] ?? catName) || "General";

    await prisma.app.update({
      where: { id: app.id },
      data: { type, appCategory },
    });
    console.log(`  ✔ ${app.title}: type=${type}, appCategory="${appCategory}"`);
  }
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

async function main() {
  console.log("🔧 Filling missing data in database...\n");

  await fillApps();
  await fillCategories();
  await fillAggregateStats();
  await fillAppTypes();

  console.log("\n✅ Done. All important fields are now populated.\n");
}

main()
  .catch((error) => {
    console.error("❌ Fill script failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
