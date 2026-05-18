import { AppStatus, AppType, Prisma, StoreSectionType, prisma } from "@elsesourav/db";
import {
  bannerPlacementSchema,
  publicAppsQuerySchema,
  sliderTypeSchema,
  storeSectionTypeSchema,
} from "@elsesourav/validation";
import { Router } from "express";
import { z } from "zod";
import { getRequestId, sendFailure, sendSuccess } from "../lib/http";

const publicCatalogQuerySchema = publicAppsQuerySchema.extend({
  sectionType: storeSectionTypeSchema.optional(),
});

const publicBannerQuerySchema = z.object({
  placement: bannerPlacementSchema.optional(),
  includeInactive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
});

const publicSliderQuerySchema = z.object({
  type: sliderTypeSchema.optional(),
  includeInactive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
});

const publicCategoryPreviewSchema = z.object({
  categoryLimit: z.coerce.number().int().min(1).max(24).default(8),
  appsPerCategory: z.coerce.number().int().min(1).max(12).default(6),
});

const publicTypePreviewSchema = z.object({
  appsPerType: z.coerce.number().int().min(1).max(12).default(6),
});

const publicSearchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  limit: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : 5))
    .pipe(z.number().int().min(1).max(10)),
  categoryId: z.string().optional(),
  mode: z.enum(["text", "rich"]).optional().default("rich"),
});

export const publicCatalogRouter = Router();

publicCatalogRouter.get("/categories", async (_req, res) => {
  const requestId = getRequestId(res);

  try {
    const categories = await prisma.category.findMany({
      where: {
        deletedAt: null,
        scheduledDeletionAt: null,
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        icon: true,
        description: true,
      },
    });

    return sendSuccess(res, requestId, categories);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch categories.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

publicCatalogRouter.get("/tags", async (_req, res) => {
  const requestId = getRequestId(res);

  try {
    const tags = await prisma.appTag.findMany({
      orderBy: [{ name: "asc" }],
      include: {
        _count: {
          select: {
            appLinks: true,
          },
        },
      },
    });

    return sendSuccess(res, requestId, tags);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch app tags.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

function resolveCardLayout(
  metadata: unknown,
  media: {
    width?: number | null;
    height?: number | null;
  } | null,
): "horizontal" | "vertical" | "square" {
  if (metadata && typeof metadata === "object") {
    const record = metadata as Record<string, unknown>;
    const card = record.card as Record<string, unknown> | undefined;
    const rawValue =
      record.cardLayout ??
      record.tileLayout ??
      record.layout ??
      record.tileSize ??
      record.size ??
      card?.layout ??
      card?.size;

    if (typeof rawValue === "string") {
      const normalized = rawValue.toLowerCase();
      if (normalized.includes("vert") || normalized.includes("tall")) {
        return "vertical";
      }
      if (normalized.includes("horiz") || normalized.includes("wide")) {
        return "horizontal";
      }
      if (normalized.includes("square")) {
        return "square";
      }
    }
  }

  const width = media?.width ?? null;
  const height = media?.height ?? null;
  if (width && height) {
    if (width / height >= 1.25) {
      return "horizontal";
    }
    if (height / width >= 1.25) {
      return "vertical";
    }
  }

  return "square";
}

/* ── Top apps (highest rated + most downloaded) ── */

const publicTopAppsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(8),
});

publicCatalogRouter.get("/top-apps", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = publicTopAppsSchema.safeParse(req.query);
    if (!parsed.success) {
      return sendFailure(res, requestId, "VALIDATION_ERROR", "Invalid query.", 400, parsed.error.flatten());
    }

    const apps = await prisma.app.findMany({
      where: { status: AppStatus.PUBLISHED, deletedAt: null },
      orderBy: [{ aggregateStat: { averageRating: "desc" } }, { aggregateStat: { downloadCount: "desc" } }, { publishedAt: "desc" }],
      take: parsed.data.limit,
      select: {
        id: true, title: true, slug: true, shortDescription: true,
        iconUrl: true, featureGraphicUrl: true, developerName: true,
        isPaid: true, price: true, type: true, appCategory: true, metadata: true,
        media: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true, thumbnailUrl: true, width: true, height: true } },
        aggregateStat: { select: { averageRating: true, downloadCount: true } },
      },
    });

    const normalizedApps = apps.map((app) => {
      const media = app.media?.[0] ?? null;
      return {
        id: app.id, title: app.title, slug: app.slug,
        shortDescription: app.shortDescription,
        iconUrl: app.iconUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(app.title.slice(0, 2))}&size=400&background=4F46E5&color=fff&bold=true&format=png`,
        featureGraphicUrl: media?.thumbnailUrl ?? media?.url ?? app.featureGraphicUrl ?? null,
        developerName: app.developerName ?? "ElseSourav Labs",
        isPaid: app.isPaid, price: app.price,
        appCategory: app.appCategory, type: app.type,
        averageRating: app.aggregateStat?.averageRating ?? null,
        layout: resolveCardLayout(app.metadata, media),
      };
    });

    return sendSuccess(res, requestId, { apps: normalizedApps });
  } catch (error) {
    return sendFailure(res, requestId, "INTERNAL_ERROR", "Failed to fetch top apps.", 500, error instanceof Error ? error.message : "Unknown error");
  }
});

publicCatalogRouter.get("/category-previews", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = publicCategoryPreviewSchema.safeParse(req.query);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid category preview query.",
        400,
        parsed.error.flatten(),
      );
    }

    const categories = await prisma.category.findMany({
      where: {
        deletedAt: null,
        scheduledDeletionAt: null,
      },
      orderBy: { name: "asc" },
      take: parsed.data.categoryLimit,
      select: {
        id: true,
        name: true,
        icon: true,
        description: true,
      },
    });

    const categoryItems = await Promise.all(
      categories.map(async (category) => {
        const apps = await prisma.app.findMany({
          where: {
            status: AppStatus.PUBLISHED,
            deletedAt: null,
            categoryId: category.id,
          },
          orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
          take: parsed.data.appsPerCategory,
          select: {
            id: true,
            title: true,
            slug: true,
            shortDescription: true,
            iconUrl: true,
            featureGraphicUrl: true,
            developerName: true,
            isPaid: true,
            price: true,
            metadata: true,
            media: {
              orderBy: { sortOrder: "asc" },
              take: 1,
              select: {
                url: true,
                thumbnailUrl: true,
                width: true,
                height: true,
              },
            },
            aggregateStat: {
              select: {
                averageRating: true,
              },
            },
          },
        });

        const normalizedApps = apps.map((app) => {
          const media = app.media?.[0] ?? null;

          return {
            id: app.id,
            title: app.title,
            slug: app.slug,
            shortDescription: app.shortDescription,
            iconUrl:
              app.iconUrl ??
              `https://ui-avatars.com/api/?name=${encodeURIComponent(app.title.slice(0, 2))}&size=400&background=4F46E5&color=fff&bold=true&format=png`,
            featureGraphicUrl:
              media?.thumbnailUrl ??
              media?.url ??
              app.featureGraphicUrl ??
              null,
            developerName: app.developerName ?? "ElseSourav Labs",
            isPaid: app.isPaid,
            price: app.price,
            averageRating: app.aggregateStat?.averageRating ?? null,
            layout: resolveCardLayout(app.metadata, media),
          };
        });

        return {
          id: category.id,
          name: category.name,
          icon: category.icon,
          description: category.description,
          apps: normalizedApps,
        };
      }),
    );

    return sendSuccess(res, requestId, {
      categories: categoryItems,
    });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch category previews.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

/* ── Type-based previews (new categorization system) ── */

const APP_TYPE_LABELS: Record<string, { name: string; description: string }> = {
  GAMING: { name: "Gaming", description: "Games, entertainment, and interactive experiences." },
  SOCIAL_MEDIA_COMMUNICATION: { name: "Social & Communication", description: "Social networking, messaging, and collaboration tools." },
  PRODUCTIVITY_BUSINESS: { name: "Productivity & Business", description: "Dashboards, dev tooling, and workflow utilities." },
  LIFESTYLE: { name: "Lifestyle", description: "Health, travel, finance, and everyday apps." },
  UTILITY_TOOL: { name: "Utilities & Tools", description: "Browser extensions, scripts, and system tools." },
};

publicCatalogRouter.get("/type-previews", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = publicTypePreviewSchema.safeParse(req.query);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid type preview query.",
        400,
        parsed.error.flatten(),
      );
    }

    const allTypes = Object.values(AppType);

    const typeGroups = await Promise.all(
      allTypes.map(async (appType) => {
        const apps = await prisma.app.findMany({
          where: {
            status: AppStatus.PUBLISHED,
            deletedAt: null,
            type: appType,
          },
          orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
          take: parsed.data.appsPerType,
          select: {
            id: true,
            title: true,
            slug: true,
            shortDescription: true,
            iconUrl: true,
            featureGraphicUrl: true,
            developerName: true,
            isPaid: true,
            price: true,
            type: true,
            appCategory: true,
            metadata: true,
            media: {
              orderBy: { sortOrder: "asc" },
              take: 1,
              select: {
                url: true,
                thumbnailUrl: true,
                width: true,
                height: true,
              },
            },
            aggregateStat: {
              select: {
                averageRating: true,
              },
            },
          },
        });

        const normalizedApps = apps.map((app) => {
          const media = app.media?.[0] ?? null;
          return {
            id: app.id,
            title: app.title,
            slug: app.slug,
            shortDescription: app.shortDescription,
            iconUrl:
              app.iconUrl ??
              `https://ui-avatars.com/api/?name=${encodeURIComponent(app.title.slice(0, 2))}&size=400&background=4F46E5&color=fff&bold=true&format=png`,
            featureGraphicUrl:
              media?.thumbnailUrl ??
              media?.url ??
              app.featureGraphicUrl ??
              null,
            developerName: app.developerName ?? "ElseSourav Labs",
            isPaid: app.isPaid,
            price: app.price,
            appCategory: app.appCategory,
            averageRating: app.aggregateStat?.averageRating ?? null,
            layout: resolveCardLayout(app.metadata, media),
          };
        });

        const label = APP_TYPE_LABELS[appType] ?? { name: appType, description: "" };

        return {
          type: appType,
          name: label.name,
          description: label.description,
          apps: normalizedApps,
        };
      }),
    );

    // Filter out types that have no published apps
    const nonEmpty = typeGroups.filter((g) => g.apps.length > 0);

    return sendSuccess(res, requestId, { types: nonEmpty });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch type previews.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

publicCatalogRouter.get("/search", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = publicSearchQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid search query.",
        400,
        parsed.error.flatten(),
      );
    }

    const query = parsed.data;
    const search = query.q.trim();

    const appWhere: Prisma.AppWhereInput = {
      status: AppStatus.PUBLISHED,
      deletedAt: null,
      OR: [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          shortDescription: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    };

    if (query.categoryId) {
      appWhere.categoryId = query.categoryId;
    }

    const apps = await prisma.app.findMany({
      where: appWhere,
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take: query.limit,
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        iconUrl: true,
      },
    });

    const items = apps.map((app) => ({
      type: "app" as const,
      id: app.id,
      title: app.title,
      subtitle: app.shortDescription,
      imageUrl: app.iconUrl,
      href: `/apps/${app.slug}`,
    }));

    return sendSuccess(res, requestId, {
      mode: query.mode,
      items,
    });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch search results.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

publicCatalogRouter.get("/sliders", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = publicSliderQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid slider query.",
        400,
        parsed.error.flatten(),
      );
    }

    const now = new Date();
    const where: Prisma.HomeSliderWhereInput = {};

    if (parsed.data.type) {
      where.type = parsed.data.type;
    }

    if (!parsed.data.includeInactive) {
      where.isActive = true;

      // Apply time window constraints
      where.AND = [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ];
    }

    const sliders = await prisma.homeSlider.findMany({
      where,
      orderBy: [{ orderIndex: "asc" }, { updatedAt: "desc" }],
      include: {
        app: {
          select: {
            id: true,
            title: true,
            slug: true,
            shortDescription: true,
            iconUrl: true,
            developerName: true,
            version: true,
            isPaid: true,
            isFeatured: true,
            price: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            media: {
              orderBy: { sortOrder: "asc" },
              take: 1,
              select: {
                id: true,
                url: true,
                alt: true,
                type: true,
              },
            },
            tagLinks: {
              select: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
            aggregateStat: {
              select: {
                viewCount: true,
                downloadCount: true,
                averageRating: true,
              },
            },
          },
        },
      },
    });

    const normalizedSliders = sliders.map((slider) => ({
      ...slider,
      app: slider.app
        ? {
            ...slider.app,
            tags: slider.app.tagLinks.map((entry) => entry.tag),
            aggregateStat: slider.app.aggregateStat,
          }
        : null,
    }));

    return sendSuccess(res, requestId, normalizedSliders);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch sliders.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

publicCatalogRouter.get("/apps", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = publicCatalogQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid query parameters.",
        400,
        parsed.error.flatten(),
      );
    }

    const query = parsed.data;

    const appWhere: Prisma.AppWhereInput = {
      status: AppStatus.PUBLISHED,
      deletedAt: null,
    };

    if (query.categoryId) {
      appWhere.categoryId = query.categoryId;
    }

    if (query.type) {
      appWhere.type = query.type as any;
    }

    if (query.search) {
      appWhere.OR = [
        {
          title: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          shortDescription: {
            contains: query.search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (query.featured !== undefined) {
      appWhere.isFeatured = query.featured;
    }

    if (query.tag) {
      appWhere.tagLinks = {
        some: {
          tag: {
            OR: [
              {
                slug: query.tag.toLowerCase(),
              },
              {
                name: {
                  contains: query.tag,
                  mode: "insensitive",
                },
              },
            ],
          },
        },
      };
    }

    if (query.sectionType) {
      const now = new Date();
      const sectionWhere: Prisma.StoreSectionItemWhereInput = {
        sectionType: query.sectionType,
        app: appWhere,
        AND: [
          {
            OR: [{ startsAt: null }, { startsAt: { lte: now } }],
          },
          {
            OR: [{ endsAt: null }, { endsAt: { gte: now } }],
          },
        ],
      };

      if (query.sectionType === StoreSectionType.UPCOMING) {
        sectionWhere.releaseAt = { gt: now };
      }

      if (query.sectionType === StoreSectionType.LATEST) {
        sectionWhere.OR = [{ releaseAt: null }, { releaseAt: { lte: now } }];
      }

      const sectionItems = await prisma.storeSectionItem.findMany({
        where: sectionWhere,
        take: query.limit,
        orderBy: [
          { orderIndex: "asc" },
          {
            releaseAt:
              query.sectionType === StoreSectionType.UPCOMING ? "asc" : "desc",
          },
          { updatedAt: "desc" },
        ],
        include: {
          app: {
            select: {
              id: true,
              title: true,
              slug: true,
              shortDescription: true,
              iconUrl: true,
              developerName: true,
              version: true,
              isPaid: true,
              isFeatured: true,
              price: true,
              status: true,
              publishedAt: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  icon: true,
                },
              },
              media: {
                orderBy: { sortOrder: "asc" },
                take: 1,
                select: {
                  id: true,
                  url: true,
                  alt: true,
                  type: true,
                  mimeType: true,
                  width: true,
                  height: true,
                  durationSec: true,
                  thumbnailUrl: true,
                  isAnimated: true,
                },
              },
              tagLinks: {
                select: {
                  tag: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                    },
                  },
                },
              },
              aggregateStat: {
                select: {
                  viewCount: true,
                  downloadCount: true,
                  averageRating: true,
                },
              },
            },
          },
        },
      });

      const items = sectionItems.map((item) => ({
        ...item.app,
        iconUrl:
          item.app.iconUrl ??
          `https://ui-avatars.com/api/?name=${encodeURIComponent(item.app.title.slice(0, 2))}&size=400&background=4F46E5&color=fff&bold=true&format=png`,
        developerName: item.app.developerName ?? "ElseSourav Labs",
        tags: item.app.tagLinks.map((entry) => entry.tag),
        section: {
          id: item.id,
          sectionType: item.sectionType,
          orderIndex: item.orderIndex,
          releaseAt: item.releaseAt,
          startsAt: item.startsAt,
          endsAt: item.endsAt,
        },
      }));

      return sendSuccess(res, requestId, {
        items,
        pagination: {
          limit: query.limit,
          nextCursor: null,
          hasMore: false,
        },
      });
    }

    const orderByBySort: Record<
      typeof query.sort,
      Prisma.AppOrderByWithRelationInput[]
    > = {
      latest: [{ publishedAt: "desc" }, { createdAt: "desc" }, { id: "desc" }],
      trending: [
        { downloadEvents: { _count: "desc" } },
        { publishedAt: "desc" },
        { id: "desc" },
      ],
      popular: [
        { downloadEvents: { _count: "desc" } },
        { publishedAt: "desc" },
        { id: "desc" },
      ],
      mostViewed: [
        { viewEvents: { _count: "desc" } },
        { publishedAt: "desc" },
        { id: "desc" },
      ],
      mostDownloaded: [
        { downloadEvents: { _count: "desc" } },
        { publishedAt: "desc" },
        { id: "desc" },
      ],
      topRated: [
        { feedbacks: { _count: "desc" } },
        { publishedAt: "desc" },
        { id: "desc" },
      ],
    };

    const items = await prisma.app.findMany({
      where: appWhere,
      orderBy: orderByBySort[query.sort],
      take: query.limit + 1,
      ...(query.cursor
        ? {
            cursor: { id: query.cursor },
            skip: 1,
          }
        : {}),
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        iconUrl: true,
        developerName: true,
        version: true,
        isPaid: true,
        isFeatured: true,
        price: true,
        status: true,
        publishedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        media: {
          orderBy: { sortOrder: "asc" },
          take: 1,
          select: {
            id: true,
            url: true,
            alt: true,
            type: true,
            mimeType: true,
            width: true,
            height: true,
            durationSec: true,
            thumbnailUrl: true,
            isAnimated: true,
          },
        },
        tagLinks: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        aggregateStat: {
          select: {
            viewCount: true,
            downloadCount: true,
            averageRating: true,
          },
        },
      },
    });

    const hasMore = items.length > query.limit;
    const pageItems = hasMore ? items.slice(0, query.limit) : items;
    const nextCursor = hasMore
      ? (pageItems[pageItems.length - 1]?.id ?? null)
      : null;

    const normalizedItems = pageItems.map((item) => ({
      ...item,
      iconUrl:
        item.iconUrl ??
        `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title.slice(0, 2))}&size=400&background=4F46E5&color=fff&bold=true&format=png`,
      developerName: item.developerName ?? "ElseSourav Labs",
      tags: item.tagLinks.map((entry) => entry.tag),
      aggregateStat: item.aggregateStat,
    }));

    return sendSuccess(res, requestId, {
      items: normalizedItems,
      pagination: {
        limit: query.limit,
        nextCursor,
        hasMore,
      },
    });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch catalog apps.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

publicCatalogRouter.get("/apps/:slug", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const slug = req.params.slug;
    if (!slug || slug.trim().length < 2) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid slug.",
        400,
      );
    }

    const app = await prisma.app.findFirst({
      where: {
        slug,
        status: AppStatus.PUBLISHED,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        fullDescription: true,
        releaseNotes: true,
        iconUrl: true,
        featureGraphicUrl: true,
        promoVideoUrl: true,
        supportEmail: true,
        supportWebsiteUrl: true,
        privacyPolicyUrl: true,
        containsAds: true,
        developerName: true,
        version: true,
        isPaid: true,
        isFeatured: true,
        price: true,
        publishedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        media: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            url: true,
            alt: true,
            type: true,
            mimeType: true,
            width: true,
            height: true,
            durationSec: true,
            thumbnailUrl: true,
            isAnimated: true,
          },
        },
        links: {
          select: {
            id: true,
            platform: true,
            downloadUrl: true,
            sourceCodeUrl: true,
          },
        },
        tagLinks: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        aggregateStat: {
          select: {
            viewCount: true,
            downloadCount: true,
            libraryCount: true,
            feedbackCount: true,
            averageRating: true,
            lastViewedAt: true,
            lastDownloadedAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!app) {
      return sendFailure(res, requestId, "NOT_FOUND", "App not found.", 404);
    }

    return sendSuccess(res, requestId, {
      ...app,
      iconUrl:
        app.iconUrl ??
        `https://ui-avatars.com/api/?name=${encodeURIComponent(app.title.slice(0, 2))}&size=400&background=4F46E5&color=fff&bold=true&format=png`,
      developerName: app.developerName ?? "ElseSourav Labs",
      tags: app.tagLinks.map((entry) => entry.tag),
      aggregateStat: app.aggregateStat,
    });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch app details.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

publicCatalogRouter.get("/banners", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = publicBannerQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid banner query.",
        400,
        parsed.error.flatten(),
      );
    }

    const now = new Date();

    const where: Prisma.StoreBannerWhereInput = {};

    if (parsed.data.placement) {
      where.placement = parsed.data.placement;
    }

    if (!parsed.data.includeInactive) {
      where.isActive = true;
      where.AND = [
        {
          OR: [{ liveStartsAt: null }, { liveStartsAt: { lte: now } }],
        },
        {
          OR: [{ liveEndsAt: null }, { liveEndsAt: { gte: now } }],
        },
      ];
    }

    const banners = await prisma.storeBanner.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
    });

    return sendSuccess(res, requestId, banners);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch banners.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});
