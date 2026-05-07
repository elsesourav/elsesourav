import { AppStatus, Prisma, StoreSectionType, prisma } from "@elsesourav/db";
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
