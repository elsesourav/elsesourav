import { AppStatus, Prisma, StoreSectionType, prisma } from "@elsesourav/db";
import {
  bannerPlacementSchema,
  publicAppsQuerySchema,
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

export const publicCatalogRouter = Router();

publicCatalogRouter.get("/categories", async (_req, res) => {
  const requestId = getRequestId(res);

  try {
    const categories = await prisma.category.findMany({
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
    const skip = (query.page - 1) * query.pageSize;

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

      const [total, sectionItems] = await prisma.$transaction([
        prisma.storeSectionItem.count({ where: sectionWhere }),
        prisma.storeSectionItem.findMany({
          where: sectionWhere,
          skip,
          take: query.pageSize,
          orderBy: [
            { orderIndex: "asc" },
            {
              releaseAt:
                query.sectionType === StoreSectionType.UPCOMING
                  ? "asc"
                  : "desc",
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
                version: true,
                isPaid: true,
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
                  },
                },
              },
            },
          },
        }),
      ]);

      const items = sectionItems.map((item) => ({
        ...item.app,
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
          page: query.page,
          pageSize: query.pageSize,
          total,
          totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
        },
      });
    }

    const orderBy: Prisma.AppOrderByWithRelationInput[] =
      query.sort === "trending"
        ? [{ downloadEvents: { _count: "desc" } }, { publishedAt: "desc" }]
        : [{ publishedAt: "desc" }, { createdAt: "desc" }];

    const [total, items] = await prisma.$transaction([
      prisma.app.count({ where: appWhere }),
      prisma.app.findMany({
        where: appWhere,
        skip,
        take: query.pageSize,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          shortDescription: true,
          version: true,
          isPaid: true,
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
            },
          },
        },
      }),
    ]);

    return sendSuccess(res, requestId, {
      items,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
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
        version: true,
        isPaid: true,
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
      },
    });

    if (!app) {
      return sendFailure(res, requestId, "NOT_FOUND", "App not found.", 404);
    }

    return sendSuccess(res, requestId, app);
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
          OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        },
        {
          OR: [{ endsAt: null }, { endsAt: { gte: now } }],
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
