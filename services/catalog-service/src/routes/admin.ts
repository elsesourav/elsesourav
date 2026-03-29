import { AppStatus, Prisma, prisma } from "@elsesourav/db";
import {
  appLinkCreateSchema,
  appLinkUpdateSchema,
  appTagAssignmentSchema,
  appTagCreateSchema,
  appTagUpdateSchema,
  bannerCreateSchema,
  bannerUpdateSchema,
  categorySchema,
  createAppSchema,
  homeSliderCreateSchema,
  homeSliderUpdateSchema,
  sectionItemCreateSchema,
  sectionItemsQuerySchema,
  sectionItemUpdateSchema,
  sliderTypeSchema,
  updateAppSchema,
} from "@elsesourav/validation";
import { Router } from "express";
import { z } from "zod";
import { getRequestId, sendFailure, sendSuccess } from "../lib/http";

const idParamSchema = z.object({
  id: z.string().cuid(),
});

const appLinkIdParamSchema = z.object({
  id: z.string().cuid(),
  linkId: z.string().cuid(),
});

const sliderListQuerySchema = z.object({
  type: sliderTypeSchema.optional(),
  includeInactive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
});

const CATEGORY_DELETION_GRACE_DAYS = 30;
const CATEGORY_DELETION_GRACE_MS =
  CATEGORY_DELETION_GRACE_DAYS * 24 * 60 * 60 * 1000;

export const adminCatalogRouter = Router();

adminCatalogRouter.get("/stats", async (_req, res) => {
  const requestId = getRequestId(res);

  try {
    const [appsCount, categoriesCount, recentApps] = await prisma.$transaction([
      prisma.app.count({ where: { deletedAt: null } }),
      prisma.category.count({
        where: {
          deletedAt: null,
          scheduledDeletionAt: null,
        },
      }),
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

async function generateUniqueTagSlug(
  seed: string,
  excludeTagId?: string,
): Promise<string> {
  const base = toSlug(seed) || "tag";
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await prisma.appTag.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === excludeTagId) {
      return candidate;
    }

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
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
        aggregateStat: true,
      },
    });

    return sendSuccess(
      res,
      requestId,
      items.map((item) => ({
        ...item,
        tags: item.tagLinks.map((entry) => entry.tag),
      })),
    );
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

    const category = await prisma.category.findFirst({
      where: {
        id: parsed.data.categoryId,
        deletedAt: null,
        scheduledDeletionAt: null,
      },
      select: { id: true },
    });

    if (!category) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Category is unavailable.",
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
        isFeatured: parsed.data.isFeatured,
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
      const category = await prisma.category.findFirst({
        where: {
          id: parsed.data.categoryId,
          deletedAt: null,
          scheduledDeletionAt: null,
        },
        select: { id: true },
      });

      if (!category) {
        return sendFailure(
          res,
          requestId,
          "NOT_FOUND",
          "Category is unavailable.",
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
      where: {
        deletedAt: null,
      },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            apps: {
              where: {
                deletedAt: null,
              },
            },
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
      include: {
        _count: {
          select: {
            apps: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
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

    const existing = await prisma.category.findUnique({
      where: { id: parsedId.data.id },
      select: {
        id: true,
        deletedAt: true,
        scheduledDeletionAt: true,
      },
    });

    if (!existing) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Category not found.",
        404,
      );
    }

    if (existing.deletedAt) {
      return sendFailure(
        res,
        requestId,
        "CONFLICT",
        "Category is already deleted.",
        409,
      );
    }

    if (existing.scheduledDeletionAt) {
      return sendFailure(
        res,
        requestId,
        "CONFLICT",
        "Category is pending deletion. Restore it before updating.",
        409,
      );
    }

    const category = await prisma.category.update({
      where: { id: parsedId.data.id },
      data: {
        name: parsed.data.name,
        icon: parsed.data.icon,
      },
      include: {
        _count: {
          select: {
            apps: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
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

    const existing = await prisma.category.findUnique({
      where: { id: parsedId.data.id },
      select: {
        id: true,
        deletedAt: true,
        scheduledDeletionAt: true,
      },
    });

    if (!existing) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Category not found.",
        404,
      );
    }

    if (existing.deletedAt) {
      return sendFailure(
        res,
        requestId,
        "CONFLICT",
        "Category is already deleted.",
        409,
      );
    }

    if (existing.scheduledDeletionAt) {
      return sendFailure(
        res,
        requestId,
        "CONFLICT",
        "Deletion is already scheduled for this category.",
        409,
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

    const scheduledDeletionAt = new Date(
      Date.now() + CATEGORY_DELETION_GRACE_MS,
    );

    const category = await prisma.category.update({
      where: { id: parsedId.data.id },
      data: {
        scheduledDeletionAt,
      },
      include: {
        _count: {
          select: {
            apps: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    return sendSuccess(res, requestId, category);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to schedule category deletion.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.post("/categories/:id/restore", async (req, res) => {
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

    const existing = await prisma.category.findUnique({
      where: { id: parsedId.data.id },
      select: {
        id: true,
        deletedAt: true,
        scheduledDeletionAt: true,
      },
    });

    if (!existing) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Category not found.",
        404,
      );
    }

    if (existing.deletedAt) {
      return sendFailure(
        res,
        requestId,
        "CONFLICT",
        "Category is already deleted and cannot be restored.",
        409,
      );
    }

    if (!existing.scheduledDeletionAt) {
      return sendFailure(
        res,
        requestId,
        "CONFLICT",
        "Category does not have a scheduled deletion.",
        409,
      );
    }

    const category = await prisma.category.update({
      where: { id: parsedId.data.id },
      data: {
        scheduledDeletionAt: null,
      },
      include: {
        _count: {
          select: {
            apps: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    return sendSuccess(res, requestId, category);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to restore category.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.get("/tags", async (_req, res) => {
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
      "Failed to fetch tags.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.post("/tags", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = appTagCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid tag payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const slugSeed = parsed.data.slug ?? parsed.data.name;
    const slug = await generateUniqueTagSlug(slugSeed);

    const tag = await prisma.appTag.create({
      data: {
        name: parsed.data.name,
        slug,
      },
    });

    return sendSuccess(res, requestId, tag, 201);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to create tag.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.patch("/tags/:id", async (req, res) => {
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

    const parsed = appTagUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid tag update payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const nextSlug =
      parsed.data.slug || parsed.data.name
        ? await generateUniqueTagSlug(
            parsed.data.slug ?? parsed.data.name ?? "tag",
            parsedId.data.id,
          )
        : undefined;

    const tag = await prisma.appTag.update({
      where: { id: parsedId.data.id },
      data: {
        name: parsed.data.name,
        slug: nextSlug,
      },
    });

    return sendSuccess(res, requestId, tag);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to update tag.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.delete("/tags/:id", async (req, res) => {
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

    await prisma.appTag.delete({
      where: { id: parsedId.data.id },
    });

    return sendSuccess(res, requestId, { deleted: true });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to delete tag.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.put("/apps/:id/tags", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = idParamSchema.safeParse(req.params);
    if (!parsedId.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid app id.",
        400,
      );
    }

    const parsedBody = appTagAssignmentSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid app tag payload.",
        400,
        parsedBody.error.flatten(),
      );
    }

    const app = await prisma.app.findUnique({
      where: { id: parsedId.data.id },
      select: { id: true },
    });

    if (!app) {
      return sendFailure(res, requestId, "NOT_FOUND", "App not found.", 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.appTagOnApp.deleteMany({
        where: {
          appId: parsedId.data.id,
        },
      });

      if (parsedBody.data.tagIds.length > 0) {
        await tx.appTagOnApp.createMany({
          data: parsedBody.data.tagIds.map((tagId) => ({
            appId: parsedId.data.id,
            tagId,
          })),
          skipDuplicates: true,
        });
      }
    });

    const updatedApp = await prisma.app.findUnique({
      where: { id: parsedId.data.id },
      include: {
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
      },
    });

    return sendSuccess(res, requestId, {
      appId: parsedId.data.id,
      tags: updatedApp?.tagLinks.map((entry) => entry.tag) ?? [],
    });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to update app tags.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.get("/apps/:id/links", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = idParamSchema.safeParse(req.params);
    if (!parsedId.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid app id.",
        400,
      );
    }

    const app = await prisma.app.findFirst({
      where: {
        id: parsedId.data.id,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!app) {
      return sendFailure(res, requestId, "NOT_FOUND", "App not found.", 404);
    }

    const links = await prisma.appLink.findMany({
      where: {
        appId: parsedId.data.id,
      },
      orderBy: [{ platform: "asc" }],
    });

    return sendSuccess(res, requestId, links);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch release links.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.post("/apps/:id/links", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = idParamSchema.safeParse(req.params);
    if (!parsedId.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid app id.",
        400,
      );
    }

    const parsedBody = appLinkCreateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid release link payload.",
        400,
        parsedBody.error.flatten(),
      );
    }

    const app = await prisma.app.findFirst({
      where: {
        id: parsedId.data.id,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!app) {
      return sendFailure(res, requestId, "NOT_FOUND", "App not found.", 404);
    }

    const existingLink = await prisma.appLink.findUnique({
      where: {
        appId_platform: {
          appId: parsedId.data.id,
          platform: parsedBody.data.platform,
        },
      },
      select: { id: true },
    });

    const link = existingLink
      ? await prisma.appLink.update({
          where: { id: existingLink.id },
          data: {
            downloadUrl: parsedBody.data.downloadUrl,
            sourceCodeUrl: parsedBody.data.sourceCodeUrl ?? null,
          },
        })
      : await prisma.appLink.create({
          data: {
            appId: parsedId.data.id,
            platform: parsedBody.data.platform,
            downloadUrl: parsedBody.data.downloadUrl,
            sourceCodeUrl: parsedBody.data.sourceCodeUrl ?? null,
          },
        });

    return sendSuccess(res, requestId, link, existingLink ? 200 : 201);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to save release link.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.patch("/apps/:id/links/:linkId", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedParams = appLinkIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid link id.",
        400,
      );
    }

    const parsedBody = appLinkUpdateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid release link payload.",
        400,
        parsedBody.error.flatten(),
      );
    }

    const existingLink = await prisma.appLink.findFirst({
      where: {
        id: parsedParams.data.linkId,
        appId: parsedParams.data.id,
      },
      select: {
        id: true,
        platform: true,
      },
    });

    if (!existingLink) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Release link not found.",
        404,
      );
    }

    if (
      parsedBody.data.platform &&
      parsedBody.data.platform !== existingLink.platform
    ) {
      const duplicatePlatformLink = await prisma.appLink.findUnique({
        where: {
          appId_platform: {
            appId: parsedParams.data.id,
            platform: parsedBody.data.platform,
          },
        },
        select: {
          id: true,
        },
      });

      if (
        duplicatePlatformLink &&
        duplicatePlatformLink.id !== existingLink.id
      ) {
        return sendFailure(
          res,
          requestId,
          "CONFLICT",
          "A release link for this platform already exists.",
          409,
        );
      }
    }

    const link = await prisma.appLink.update({
      where: {
        id: existingLink.id,
      },
      data: {
        platform: parsedBody.data.platform,
        downloadUrl: parsedBody.data.downloadUrl,
        sourceCodeUrl:
          parsedBody.data.sourceCodeUrl === undefined
            ? undefined
            : parsedBody.data.sourceCodeUrl,
      },
    });

    return sendSuccess(res, requestId, link);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to update release link.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.delete("/apps/:id/links/:linkId", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedParams = appLinkIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid link id.",
        400,
      );
    }

    const existingLink = await prisma.appLink.findFirst({
      where: {
        id: parsedParams.data.linkId,
        appId: parsedParams.data.id,
      },
      select: {
        id: true,
      },
    });

    if (!existingLink) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Release link not found.",
        404,
      );
    }

    await prisma.appLink.delete({
      where: {
        id: existingLink.id,
      },
    });

    return sendSuccess(res, requestId, { deleted: true });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to delete release link.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.get("/sliders", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = sliderListQuerySchema.safeParse(req.query);
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

    const where: Prisma.HomeSliderWhereInput = {};
    if (parsed.data.type) {
      where.type = parsed.data.type;
    }
    if (!parsed.data.includeInactive) {
      where.isActive = true;
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
            status: true,
          },
        },
      },
    });

    return sendSuccess(res, requestId, sliders);
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

adminCatalogRouter.post("/sliders", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = homeSliderCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid slider payload.",
        400,
        parsed.error.flatten(),
      );
    }

    if (parsed.data.appId) {
      const app = await prisma.app.findUnique({
        where: { id: parsed.data.appId },
        select: { id: true },
      });

      if (!app) {
        return sendFailure(
          res,
          requestId,
          "NOT_FOUND",
          "Linked app not found.",
          404,
        );
      }
    }

    const userId = req.header("x-user-id") ?? null;

    const slider = await prisma.homeSlider.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        type: parsed.data.type,
        imageUrl: parsed.data.imageUrl,
        linkUrl: parsed.data.linkUrl,
        appId: parsed.data.appId,
        orderIndex: parsed.data.orderIndex,
        startsAt: parsed.data.startsAt,
        endsAt: parsed.data.endsAt,
        isActive: parsed.data.isActive,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    return sendSuccess(res, requestId, slider, 201);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to create slider.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.patch("/sliders/:id", async (req, res) => {
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

    const parsed = homeSliderUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid slider update payload.",
        400,
        parsed.error.flatten(),
      );
    }

    if (parsed.data.appId) {
      const app = await prisma.app.findUnique({
        where: { id: parsed.data.appId },
        select: { id: true },
      });

      if (!app) {
        return sendFailure(
          res,
          requestId,
          "NOT_FOUND",
          "Linked app not found.",
          404,
        );
      }
    }

    const userId = req.header("x-user-id") ?? null;

    const slider = await prisma.homeSlider.update({
      where: { id: parsedId.data.id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        type: parsed.data.type,
        imageUrl: parsed.data.imageUrl,
        linkUrl: parsed.data.linkUrl,
        appId: parsed.data.appId,
        orderIndex: parsed.data.orderIndex,
        startsAt: parsed.data.startsAt,
        endsAt: parsed.data.endsAt,
        isActive: parsed.data.isActive,
        updatedBy: userId,
      },
    });

    return sendSuccess(res, requestId, slider);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to update slider.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.delete("/sliders/:id", async (req, res) => {
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

    const slider = await prisma.homeSlider.update({
      where: { id: parsedId.data.id },
      data: {
        isActive: false,
        updatedBy: userId,
      },
    });

    return sendSuccess(res, requestId, slider);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to disable slider.",
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
