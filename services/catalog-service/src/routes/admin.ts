import { AppStatus, Prisma, prisma } from "@elsesourav/db";
import {
  bannerCreateSchema,
  bannerUpdateSchema,
  categorySchema,
  createAppSchema,
  sectionItemCreateSchema,
  sectionItemsQuerySchema,
  sectionItemUpdateSchema,
  updateAppSchema,
} from "@elsesourav/validation";
import { Router } from "express";
import { z } from "zod";
import { getRequestId, sendFailure, sendSuccess } from "../lib/http";

const idParamSchema = z.object({
  id: z.string().cuid(),
});

export const adminCatalogRouter = Router();

adminCatalogRouter.get("/stats", async (_req, res) => {
  const requestId = getRequestId(res);

  try {
    const [appsCount, categoriesCount, recentApps] = await prisma.$transaction([
      prisma.app.count({ where: { deletedAt: null } }),
      prisma.category.count(),
      prisma.app.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return sendSuccess(res, requestId, {
      appsCount,
      categoriesCount,
      recentApps,
    });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch catalog stats.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function generateUniqueSlug(seed: string): Promise<string> {
  const base = toSlug(seed) || "app";
  let candidate = base;
  let suffix = 2;

  while (
    await prisma.app.findUnique({
      where: { slug: candidate },
      select: { id: true },
    })
  ) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

adminCatalogRouter.get("/apps", async (_req, res) => {
  const requestId = getRequestId(res);

  try {
    const items = await prisma.app.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            feedbacks: true,
            downloadEvents: true,
          },
        },
      },
    });

    return sendSuccess(res, requestId, items);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch admin apps.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.post("/apps", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = createAppSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid app payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: parsed.data.categoryId },
      select: { id: true },
    });

    if (!category) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Category does not exist.",
        404,
      );
    }

    const slug = await generateUniqueSlug(parsed.data.title);
    const userId = req.header("x-user-id") ?? null;

    const app = await prisma.app.create({
      data: {
        title: parsed.data.title,
        slug,
        shortDescription: parsed.data.shortDescription,
        fullDescription: parsed.data.fullDescription,
        version: parsed.data.version,
        status: parsed.data.status,
        publishedAt:
          parsed.data.status === AppStatus.PUBLISHED ? new Date() : null,
        isPaid: parsed.data.isPaid,
        price: parsed.data.isPaid ? parsed.data.price : 0,
        categoryId: parsed.data.categoryId,
        createdById: userId ?? "system-admin",
        updatedById: userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return sendSuccess(res, requestId, app, 201);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to create app.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.put("/apps/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = idParamSchema.safeParse(req.params);
    if (!parsedId.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid id.",
        400,
      );
    }

    const parsed = updateAppSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid app payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const existing = await prisma.app.findUnique({
      where: { id: parsedId.data.id },
      select: { id: true, status: true },
    });

    if (!existing) {
      return sendFailure(res, requestId, "NOT_FOUND", "App not found.", 404);
    }

    if (parsed.data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: parsed.data.categoryId },
        select: { id: true },
      });

      if (!category) {
        return sendFailure(
          res,
          requestId,
          "NOT_FOUND",
          "Category does not exist.",
          404,
        );
      }
    }

    const userId = req.header("x-user-id") ?? null;

    const app = await prisma.app.update({
      where: { id: parsedId.data.id },
      data: {
        ...parsed.data,
        price: parsed.data.isPaid === false ? 0 : parsed.data.price,
        publishedAt:
          parsed.data.status === AppStatus.PUBLISHED &&
          existing.status !== AppStatus.PUBLISHED
            ? new Date()
            : parsed.data.status === AppStatus.DRAFT
              ? null
              : undefined,
        updatedById: userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return sendSuccess(res, requestId, app);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to update app.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.delete("/apps/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = idParamSchema.safeParse(req.params);
    if (!parsedId.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid id.",
        400,
      );
    }

    const existing = await prisma.app.findUnique({
      where: { id: parsedId.data.id },
      select: { id: true },
    });

    if (!existing) {
      return sendFailure(res, requestId, "NOT_FOUND", "App not found.", 404);
    }

    const userId = req.header("x-user-id") ?? null;

    await prisma.app.update({
      where: { id: parsedId.data.id },
      data: {
        status: AppStatus.DRAFT,
        publishedAt: null,
        deletedAt: new Date(),
        updatedById: userId,
      },
    });

    return sendSuccess(res, requestId, { deleted: true });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to delete app.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.get("/categories", async (_req, res) => {
  const requestId = getRequestId(res);

  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            apps: true,
          },
        },
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

adminCatalogRouter.post("/categories", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = categorySchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid category payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const category = await prisma.category.create({
      data: {
        name: parsed.data.name,
        icon: parsed.data.icon,
      },
    });

    return sendSuccess(res, requestId, category, 201);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to create category.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.put("/categories/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = idParamSchema.safeParse(req.params);
    if (!parsedId.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid id.",
        400,
      );
    }

    const parsed = categorySchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid category payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const category = await prisma.category.update({
      where: { id: parsedId.data.id },
      data: {
        name: parsed.data.name,
        icon: parsed.data.icon,
      },
    });

    return sendSuccess(res, requestId, category);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to update category.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.delete("/categories/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = idParamSchema.safeParse(req.params);
    if (!parsedId.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid id.",
        400,
      );
    }

    const dependentApps = await prisma.app.count({
      where: {
        categoryId: parsedId.data.id,
        deletedAt: null,
      },
    });

    if (dependentApps > 0) {
      return sendFailure(
        res,
        requestId,
        "CONFLICT",
        "Category still has active apps.",
        409,
      );
    }

    await prisma.category.delete({
      where: { id: parsedId.data.id },
    });

    return sendSuccess(res, requestId, { deleted: true });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to delete category.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.get("/sections/items", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = sectionItemsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid section item query.",
        400,
        parsed.error.flatten(),
      );
    }

    const skip = (parsed.data.page - 1) * parsed.data.pageSize;
    const where: Prisma.StoreSectionItemWhereInput = parsed.data.sectionType
      ? { sectionType: parsed.data.sectionType }
      : {};

    const [total, items] = await prisma.$transaction([
      prisma.storeSectionItem.count({ where }),
      prisma.storeSectionItem.findMany({
        where,
        skip,
        take: parsed.data.pageSize,
        orderBy: [{ orderIndex: "asc" }, { updatedAt: "desc" }],
        include: {
          app: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
            },
          },
        },
      }),
    ]);

    return sendSuccess(res, requestId, {
      items,
      pagination: {
        page: parsed.data.page,
        pageSize: parsed.data.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / parsed.data.pageSize)),
      },
    });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch section items.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.post("/sections/items", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = sectionItemCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid section item payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const createdBy = req.header("x-user-id") ?? null;

    const item = await prisma.storeSectionItem.upsert({
      where: {
        appId_sectionType: {
          appId: parsed.data.appId,
          sectionType: parsed.data.sectionType,
        },
      },
      update: {
        orderIndex: parsed.data.orderIndex,
        releaseAt: parsed.data.releaseAt,
        startsAt: parsed.data.startsAt,
        endsAt: parsed.data.endsAt,
      },
      create: {
        appId: parsed.data.appId,
        sectionType: parsed.data.sectionType,
        orderIndex: parsed.data.orderIndex,
        releaseAt: parsed.data.releaseAt,
        startsAt: parsed.data.startsAt,
        endsAt: parsed.data.endsAt,
      },
      include: {
        app: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return sendSuccess(
      res,
      requestId,
      {
        ...item,
        updatedBy: createdBy,
      },
      201,
    );
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to save section item.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.patch("/sections/items/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = idParamSchema.safeParse(req.params);
    if (!parsedId.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid id.",
        400,
      );
    }

    const parsedBody = sectionItemUpdateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid section update payload.",
        400,
        parsedBody.error.flatten(),
      );
    }

    const item = await prisma.storeSectionItem.update({
      where: { id: parsedId.data.id },
      data: {
        orderIndex: parsedBody.data.orderIndex,
        releaseAt: parsedBody.data.releaseAt,
        startsAt: parsedBody.data.startsAt,
        endsAt: parsedBody.data.endsAt,
      },
      include: {
        app: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return sendSuccess(res, requestId, item);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to update section item.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.delete("/sections/items/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = idParamSchema.safeParse(req.params);
    if (!parsedId.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid id.",
        400,
      );
    }

    await prisma.storeSectionItem.delete({
      where: { id: parsedId.data.id },
    });

    return sendSuccess(res, requestId, { deleted: true });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to delete section item.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.get("/banners", async (_req, res) => {
  const requestId = getRequestId(res);

  try {
    const banners = await prisma.storeBanner.findMany({
      orderBy: [{ updatedAt: "desc" }],
    });

    return sendSuccess(res, requestId, banners);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch admin banners.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.post("/banners", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = bannerCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid banner payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const userId = req.header("x-user-id") ?? null;

    const banner = await prisma.storeBanner.create({
      data: {
        title: parsed.data.title,
        imageUrl: parsed.data.imageUrl,
        linkUrl: parsed.data.linkUrl ?? null,
        placement: parsed.data.placement,
        startsAt: parsed.data.startsAt,
        endsAt: parsed.data.endsAt,
        isActive: parsed.data.isActive,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    return sendSuccess(res, requestId, banner, 201);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to create banner.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.patch("/banners/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = idParamSchema.safeParse(req.params);
    if (!parsedId.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid id.",
        400,
      );
    }

    const parsedBody = bannerUpdateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid banner update payload.",
        400,
        parsedBody.error.flatten(),
      );
    }

    const userId = req.header("x-user-id") ?? null;

    const banner = await prisma.storeBanner.update({
      where: { id: parsedId.data.id },
      data: {
        title: parsedBody.data.title,
        imageUrl: parsedBody.data.imageUrl,
        linkUrl: parsedBody.data.linkUrl,
        placement: parsedBody.data.placement,
        startsAt: parsedBody.data.startsAt,
        endsAt: parsedBody.data.endsAt,
        isActive: parsedBody.data.isActive,
        updatedBy: userId,
      },
    });

    return sendSuccess(res, requestId, banner);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to update banner.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.delete("/banners/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = idParamSchema.safeParse(req.params);
    if (!parsedId.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid id.",
        400,
      );
    }

    const userId = req.header("x-user-id") ?? null;

    const banner = await prisma.storeBanner.update({
      where: { id: parsedId.data.id },
      data: {
        isActive: false,
        updatedBy: userId,
      },
    });

    return sendSuccess(res, requestId, banner);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to disable banner.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});
