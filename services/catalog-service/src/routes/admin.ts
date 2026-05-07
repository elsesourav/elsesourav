import { AppStatus, Prisma, prisma } from "@elsesourav/db";
import {
  appLinkCreateSchema,
  appLinkUpdateSchema,
  appMediaCreateSchema,
  appMediaUpdateSchema,
  appTagAssignmentSchema,
  appTagCreateSchema,
  appTagUpdateSchema,
  bannerCreateSchema,
  bannerUpdateSchema,
  categorySchema,
  createAppSchema,
  customFieldDefinitionCreateSchema,
  customFieldDefinitionUpdateSchema,
  customFieldEntitySchema,
  customFieldValuesQuerySchema,
  customFieldValueUpdateSchema,
  customFieldValueUpsertSchema,
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

const appMediaIdParamSchema = z.object({
  id: z.string().cuid(),
  mediaId: z.string().cuid(),
});

const customFieldDefinitionQuerySchema = z.object({
  entity: customFieldEntitySchema.optional(),
  includeInactive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
});

const customFieldValueIdParamSchema = z.object({
  id: z.string().cuid(),
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

function normalizeMediaResponse<T extends { fileSizeBytes?: bigint | null }>(
  media: T,
): Omit<T, "fileSizeBytes"> & { fileSizeBytes: string | null } {
  return {
    ...media,
    fileSizeBytes:
      media.fileSizeBytes !== undefined && media.fileSizeBytes !== null
        ? media.fileSizeBytes.toString()
        : null,
  };
}

function toNullablePrismaJson(
  value: unknown,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
  if (value === null) {
    return Prisma.JsonNull;
  }

  return value as Prisma.InputJsonValue;
}

function toRequiredPrismaJson(
  value: unknown,
): Prisma.InputJsonValue | Prisma.JsonNullValueInput {
  if (value === null) {
    return Prisma.JsonNull;
  }

  return value as Prisma.InputJsonValue;
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
        releaseNotes: parsed.data.releaseNotes,
        version: parsed.data.version,
        status: parsed.data.status,
        publishedAt:
          parsed.data.status === AppStatus.PUBLISHED ? new Date() : null,
        isPaid: parsed.data.isPaid,
        isFeatured: parsed.data.isFeatured,
        price: parsed.data.isPaid ? parsed.data.price : 0,
        iconUrl: parsed.data.iconUrl,
        featureGraphicUrl: parsed.data.featureGraphicUrl,
        promoVideoUrl: parsed.data.promoVideoUrl,
        supportEmail: parsed.data.supportEmail,
        supportWebsiteUrl: parsed.data.supportWebsiteUrl,
        privacyPolicyUrl: parsed.data.privacyPolicyUrl,
        containsAds: parsed.data.containsAds,
        developerName: parsed.data.developerName,
        metadata: parsed.data.metadata as Prisma.InputJsonValue | undefined,
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
        metadata: parsed.data.metadata as Prisma.InputJsonValue | undefined,
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

adminCatalogRouter.get("/apps/:id/media", async (req, res) => {
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

    const media = await prisma.appMedia.findMany({
      where: {
        appId: parsedId.data.id,
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        appId: true,
        type: true,
        url: true,
        alt: true,
        mimeType: true,
        width: true,
        height: true,
        durationSec: true,
        thumbnailUrl: true,
        fileSizeBytes: true,
        isAnimated: true,
        sortOrder: true,
        createdAt: true,
      },
    });

    return sendSuccess(
      res,
      requestId,
      media.map((entry) => normalizeMediaResponse(entry)),
    );
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch app media.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.post("/apps/:id/media", async (req, res) => {
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

    const parsedBody = appMediaCreateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid app media payload.",
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

    const media = await prisma.appMedia.create({
      data: {
        appId: parsedId.data.id,
        type: parsedBody.data.type,
        url: parsedBody.data.url,
        alt: parsedBody.data.alt ?? null,
        mimeType: parsedBody.data.mimeType ?? null,
        width: parsedBody.data.width ?? null,
        height: parsedBody.data.height ?? null,
        durationSec: parsedBody.data.durationSec ?? null,
        thumbnailUrl: parsedBody.data.thumbnailUrl ?? null,
        fileSizeBytes: parsedBody.data.fileSizeBytes
          ? BigInt(parsedBody.data.fileSizeBytes)
          : null,
        isAnimated: parsedBody.data.isAnimated ?? false,
        sortOrder: parsedBody.data.sortOrder,
      },
    });

    return sendSuccess(res, requestId, normalizeMediaResponse(media), 201);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to save app media.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.patch("/apps/:id/media/:mediaId", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedParams = appMediaIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid media id.",
        400,
      );
    }

    const parsedBody = appMediaUpdateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid app media payload.",
        400,
        parsedBody.error.flatten(),
      );
    }

    const existing = await prisma.appMedia.findFirst({
      where: {
        id: parsedParams.data.mediaId,
        appId: parsedParams.data.id,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return sendFailure(res, requestId, "NOT_FOUND", "Media not found.", 404);
    }

    const media = await prisma.appMedia.update({
      where: {
        id: existing.id,
      },
      data: {
        type: parsedBody.data.type,
        url: parsedBody.data.url,
        alt:
          parsedBody.data.alt === undefined
            ? undefined
            : (parsedBody.data.alt ?? null),
        mimeType:
          parsedBody.data.mimeType === undefined
            ? undefined
            : (parsedBody.data.mimeType ?? null),
        width:
          parsedBody.data.width === undefined
            ? undefined
            : (parsedBody.data.width ?? null),
        height:
          parsedBody.data.height === undefined
            ? undefined
            : (parsedBody.data.height ?? null),
        durationSec:
          parsedBody.data.durationSec === undefined
            ? undefined
            : (parsedBody.data.durationSec ?? null),
        thumbnailUrl:
          parsedBody.data.thumbnailUrl === undefined
            ? undefined
            : (parsedBody.data.thumbnailUrl ?? null),
        fileSizeBytes:
          parsedBody.data.fileSizeBytes === undefined
            ? undefined
            : parsedBody.data.fileSizeBytes
              ? BigInt(parsedBody.data.fileSizeBytes)
              : null,
        isAnimated: parsedBody.data.isAnimated,
        sortOrder: parsedBody.data.sortOrder,
      },
    });

    return sendSuccess(res, requestId, normalizeMediaResponse(media));
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to update app media.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.delete("/apps/:id/media/:mediaId", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedParams = appMediaIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid media id.",
        400,
      );
    }

    const existing = await prisma.appMedia.findFirst({
      where: {
        id: parsedParams.data.mediaId,
        appId: parsedParams.data.id,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return sendFailure(res, requestId, "NOT_FOUND", "Media not found.", 404);
    }

    await prisma.appMedia.delete({
      where: {
        id: existing.id,
      },
    });

    return sendSuccess(res, requestId, { deleted: true });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to delete app media.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.get("/custom-fields", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = customFieldDefinitionQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid custom fields query.",
        400,
        parsed.error.flatten(),
      );
    }

    const where: Prisma.CustomFieldDefinitionWhereInput = {};

    if (parsed.data.entity) {
      where.entity = parsed.data.entity;
    }

    if (!parsed.data.includeInactive) {
      where.isActive = true;
    }

    const definitions = await prisma.customFieldDefinition.findMany({
      where,
      orderBy: [{ entity: "asc" }, { key: "asc" }],
      include: {
        _count: {
          select: {
            values: true,
          },
        },
      },
    });

    return sendSuccess(res, requestId, definitions);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch custom fields.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.post("/custom-fields", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = customFieldDefinitionCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid custom field definition payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const existing = await prisma.customFieldDefinition.findUnique({
      where: {
        entity_key: {
          entity: parsed.data.entity,
          key: parsed.data.key,
        },
      },
      select: { id: true },
    });

    if (existing) {
      return sendFailure(
        res,
        requestId,
        "CONFLICT",
        "A custom field with this key already exists for the selected entity.",
        409,
      );
    }

    const definition = await prisma.customFieldDefinition.create({
      data: {
        entity: parsed.data.entity,
        key: parsed.data.key,
        label: parsed.data.label,
        description: parsed.data.description || null,
        fieldType: parsed.data.fieldType,
        isRequired: parsed.data.isRequired,
        isActive: parsed.data.isActive,
        isFilterable: parsed.data.isFilterable,
        options:
          parsed.data.options === undefined
            ? undefined
            : toNullablePrismaJson(parsed.data.options),
        defaultValue:
          parsed.data.defaultValue === undefined
            ? undefined
            : toNullablePrismaJson(parsed.data.defaultValue),
      },
      include: {
        _count: {
          select: {
            values: true,
          },
        },
      },
    });

    return sendSuccess(res, requestId, definition, 201);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to create custom field definition.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.get("/custom-fields/values", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = customFieldValuesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid custom field values query.",
        400,
        parsed.error.flatten(),
      );
    }

    const where: Prisma.CustomFieldValueWhereInput = {};

    if (parsed.data.definitionId) {
      where.definitionId = parsed.data.definitionId;
    }

    if (parsed.data.entityId) {
      where.entityId = parsed.data.entityId;
    }

    if (parsed.data.entity) {
      where.definition = {
        entity: parsed.data.entity,
      };
    }

    const values = await prisma.customFieldValue.findMany({
      where,
      take: parsed.data.limit,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      include: {
        definition: {
          select: {
            id: true,
            entity: true,
            key: true,
            label: true,
            fieldType: true,
          },
        },
      },
    });

    return sendSuccess(res, requestId, values);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch custom field values.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.post("/custom-fields/values", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = customFieldValueUpsertSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid custom field value payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const definition = await prisma.customFieldDefinition.findUnique({
      where: { id: parsed.data.definitionId },
      select: { id: true },
    });

    if (!definition) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Custom field definition not found.",
        404,
      );
    }

    const existing = await prisma.customFieldValue.findUnique({
      where: {
        definitionId_entityId: {
          definitionId: parsed.data.definitionId,
          entityId: parsed.data.entityId,
        },
      },
      select: { id: true },
    });

    const value = existing
      ? await prisma.customFieldValue.update({
          where: {
            id: existing.id,
          },
          data: {
            value: toRequiredPrismaJson(parsed.data.value),
          },
          include: {
            definition: {
              select: {
                id: true,
                entity: true,
                key: true,
                label: true,
                fieldType: true,
              },
            },
          },
        })
      : await prisma.customFieldValue.create({
          data: {
            definitionId: parsed.data.definitionId,
            entityId: parsed.data.entityId,
            value: toRequiredPrismaJson(parsed.data.value),
          },
          include: {
            definition: {
              select: {
                id: true,
                entity: true,
                key: true,
                label: true,
                fieldType: true,
              },
            },
          },
        });

    return sendSuccess(res, requestId, value, existing ? 200 : 201);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to save custom field value.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.patch("/custom-fields/values/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = customFieldValueIdParamSchema.safeParse(req.params);
    if (!parsedId.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid custom field value id.",
        400,
      );
    }

    const parsedBody = customFieldValueUpdateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid custom field value payload.",
        400,
        parsedBody.error.flatten(),
      );
    }

    const existing = await prisma.customFieldValue.findUnique({
      where: {
        id: parsedId.data.id,
      },
      select: { id: true },
    });

    if (!existing) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Custom field value not found.",
        404,
      );
    }

    const value = await prisma.customFieldValue.update({
      where: {
        id: existing.id,
      },
      data: {
        value: toRequiredPrismaJson(parsedBody.data.value),
      },
      include: {
        definition: {
          select: {
            id: true,
            entity: true,
            key: true,
            label: true,
            fieldType: true,
          },
        },
      },
    });

    return sendSuccess(res, requestId, value);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to update custom field value.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.delete("/custom-fields/values/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = customFieldValueIdParamSchema.safeParse(req.params);
    if (!parsedId.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid custom field value id.",
        400,
      );
    }

    const existing = await prisma.customFieldValue.findUnique({
      where: {
        id: parsedId.data.id,
      },
      select: { id: true },
    });

    if (!existing) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Custom field value not found.",
        404,
      );
    }

    await prisma.customFieldValue.delete({
      where: {
        id: existing.id,
      },
    });

    return sendSuccess(res, requestId, { deleted: true });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to delete custom field value.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.patch("/custom-fields/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = idParamSchema.safeParse(req.params);
    if (!parsedId.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid custom field definition id.",
        400,
      );
    }

    const parsedBody = customFieldDefinitionUpdateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid custom field definition payload.",
        400,
        parsedBody.error.flatten(),
      );
    }

    const existing = await prisma.customFieldDefinition.findUnique({
      where: {
        id: parsedId.data.id,
      },
      select: {
        id: true,
        entity: true,
        key: true,
      },
    });

    if (!existing) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Custom field definition not found.",
        404,
      );
    }

    const nextEntity = parsedBody.data.entity ?? existing.entity;
    const nextKey = parsedBody.data.key ?? existing.key;

    if (nextEntity !== existing.entity || nextKey !== existing.key) {
      const duplicate = await prisma.customFieldDefinition.findUnique({
        where: {
          entity_key: {
            entity: nextEntity,
            key: nextKey,
          },
        },
        select: {
          id: true,
        },
      });

      if (duplicate && duplicate.id !== existing.id) {
        return sendFailure(
          res,
          requestId,
          "CONFLICT",
          "A custom field with this key already exists for the selected entity.",
          409,
        );
      }
    }

    const definition = await prisma.customFieldDefinition.update({
      where: {
        id: existing.id,
      },
      data: {
        entity: parsedBody.data.entity,
        key: parsedBody.data.key,
        label: parsedBody.data.label,
        description:
          parsedBody.data.description === undefined
            ? undefined
            : parsedBody.data.description || null,
        fieldType: parsedBody.data.fieldType,
        isRequired: parsedBody.data.isRequired,
        isActive: parsedBody.data.isActive,
        isFilterable: parsedBody.data.isFilterable,
        options:
          parsedBody.data.options === undefined
            ? undefined
            : toNullablePrismaJson(parsedBody.data.options),
        defaultValue:
          parsedBody.data.defaultValue === undefined
            ? undefined
            : toNullablePrismaJson(parsedBody.data.defaultValue),
      },
      include: {
        _count: {
          select: {
            values: true,
          },
        },
      },
    });

    return sendSuccess(res, requestId, definition);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to update custom field definition.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminCatalogRouter.delete("/custom-fields/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = idParamSchema.safeParse(req.params);
    if (!parsedId.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid custom field definition id.",
        400,
      );
    }

    const existing = await prisma.customFieldDefinition.findUnique({
      where: {
        id: parsedId.data.id,
      },
      select: { id: true },
    });

    if (!existing) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Custom field definition not found.",
        404,
      );
    }

    await prisma.customFieldDefinition.delete({
      where: {
        id: existing.id,
      },
    });

    return sendSuccess(res, requestId, { deleted: true });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to delete custom field definition.",
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
        subtitle: parsed.data.subtitle ?? null,
        imageUrl: parsed.data.imageUrl,
        linkUrl: parsed.data.linkUrl ?? null,
        placement: parsed.data.placement,
        liveStartsAt: parsed.data.liveStartsAt,
        liveEndsAt: parsed.data.liveEndsAt,
        appStartsAt: parsed.data.appStartsAt,
        appEndsAt: parsed.data.appEndsAt,
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
        subtitle: parsedBody.data.subtitle,
        imageUrl: parsedBody.data.imageUrl,
        linkUrl: parsedBody.data.linkUrl,
        placement: parsedBody.data.placement,
        liveStartsAt: parsedBody.data.liveStartsAt,
        liveEndsAt: parsedBody.data.liveEndsAt,
        appStartsAt: parsedBody.data.appStartsAt,
        appEndsAt: parsedBody.data.appEndsAt,
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
