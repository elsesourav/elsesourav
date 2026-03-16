import {
  BlogPostStatus,
  ContentStatus,
  HelpArticleStatus,
  Prisma,
  prisma,
} from "@elsesourav/db";
import {
  blogCommentModerationSchema,
  blogPostCreateSchema,
  blogPostUpdateSchema,
  blogTagCreateSchema,
  blogTagUpdateSchema,
  contentPageCreateSchema,
  contentPageUpdateSchema,
  helpArticleCreateSchema,
  helpArticleUpdateSchema,
  helpCategoryCreateSchema,
  helpCategoryUpdateSchema,
  profilePageCreateSchema,
  profilePageUpdateSchema,
  testimonialCreateSchema,
  testimonialUpdateSchema,
} from "@elsesourav/validation";
import { Router } from "express";
import { z } from "zod";
import { getRequestId, sendFailure, sendSuccess } from "../lib/http";

const pageIdSchema = z.object({
  id: z.string().cuid(),
});

const blogListQuerySchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  cursor: z.string().cuid().optional(),
  limit: z.coerce.number().int().min(1).max(30).default(12),
});

const helpListQuerySchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  cursor: z.string().cuid().optional(),
  limit: z.coerce.number().int().min(1).max(30).default(12),
});

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

async function generateUniqueBlogTagSlug(
  seed: string,
  excludeId?: string,
): Promise<string> {
  const base = toSlug(seed) || "tag";
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await prisma.blogTag.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) {
      return candidate;
    }

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export const adminContentRouter = Router();

adminContentRouter.get("/pages", async (_req, res) => {
  const requestId = getRequestId(res);

  try {
    const pages = await prisma.contentPage.findMany({
      orderBy: [{ updatedAt: "desc" }],
      include: {
        versions: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });

    return sendSuccess(res, requestId, pages);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch pages.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.post("/pages", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = contentPageCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid page payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const userId = req.header("x-user-id") ?? null;

    const page = await prisma.contentPage.create({
      data: {
        slug: parsed.data.slug,
        title: parsed.data.title,
        summary: parsed.data.summary,
        body: parsed.data.body,
        seoTitle: parsed.data.seoTitle,
        seoDescription: parsed.data.seoDescription,
        status: parsed.data.status,
        publishAt: parsed.data.publishAt,
        createdBy: userId,
        updatedBy: userId,
        publishedAt:
          parsed.data.status === ContentStatus.PUBLISHED ? new Date() : null,
        versions: {
          create: {
            version: 1,
            title: parsed.data.title,
            summary: parsed.data.summary,
            body: parsed.data.body,
            seoTitle: parsed.data.seoTitle,
            seoDescription: parsed.data.seoDescription,
            status: parsed.data.status,
            createdBy: userId,
          },
        },
      },
      include: {
        versions: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });

    return sendSuccess(res, requestId, page, 201);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to create page.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.put("/pages/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = pageIdSchema.safeParse(req.params);
    if (!parsedId.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid id.",
        400,
      );
    }

    const parsed = contentPageUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid page update payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const userId = req.header("x-user-id") ?? null;

    const existing = await prisma.contentPage.findUnique({
      where: { id: parsedId.data.id },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return sendFailure(res, requestId, "NOT_FOUND", "Page not found.", 404);
    }

    const latestVersion = await prisma.contentPageVersion.findFirst({
      where: { pageId: parsedId.data.id },
      orderBy: { version: "desc" },
      select: { version: true },
    });

    const nextVersion = (latestVersion?.version ?? 0) + 1;

    const page = await prisma.contentPage.update({
      where: { id: parsedId.data.id },
      data: {
        slug: parsed.data.slug,
        title: parsed.data.title,
        summary: parsed.data.summary,
        body: parsed.data.body,
        seoTitle: parsed.data.seoTitle,
        seoDescription: parsed.data.seoDescription,
        status: parsed.data.status,
        publishAt: parsed.data.publishAt,
        updatedBy: userId,
        versions: {
          create: {
            version: nextVersion,
            title: parsed.data.title ?? "",
            summary: parsed.data.summary,
            body: parsed.data.body ?? "",
            seoTitle: parsed.data.seoTitle,
            seoDescription: parsed.data.seoDescription,
            status: parsed.data.status ?? ContentStatus.DRAFT,
            createdBy: userId,
          },
        },
      },
      include: {
        versions: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });

    return sendSuccess(res, requestId, page);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to update page.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.post("/pages/:id/publish", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = pageIdSchema.safeParse(req.params);
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

    const page = await prisma.contentPage.update({
      where: { id: parsedId.data.id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        publishAt: new Date(),
        updatedBy: userId,
      },
    });

    return sendSuccess(res, requestId, page);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to publish page.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.get("/profile", async (_req, res) => {
  const requestId = getRequestId(res);

  try {
    const profile = await prisma.profilePage.findFirst({
      orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    });

    return sendSuccess(res, requestId, profile);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch profile page.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.put("/profile", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = profilePageCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid profile payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const userId = req.header("x-user-id") ?? null;

    const profile = await prisma.profilePage.upsert({
      where: {
        slug: parsed.data.slug,
      },
      update: {
        fullName: parsed.data.fullName,
        headline: parsed.data.headline,
        shortBio: parsed.data.shortBio,
        bioMarkdown: parsed.data.bioMarkdown,
        experienceMarkdown: parsed.data.experienceMarkdown,
        skills: parsed.data.skills ?? Prisma.JsonNull,
        tools: parsed.data.tools ?? Prisma.JsonNull,
        contactEmail: parsed.data.contactEmail,
        location: parsed.data.location,
        websiteUrl: parsed.data.websiteUrl,
        githubUrl: parsed.data.githubUrl,
        linkedinUrl: parsed.data.linkedinUrl,
        resumeUrl: parsed.data.resumeUrl,
        avatarUrl: parsed.data.avatarUrl,
        coverImageUrl: parsed.data.coverImageUrl,
        isActive: parsed.data.isActive,
        updatedBy: userId,
      },
      create: {
        slug: parsed.data.slug,
        fullName: parsed.data.fullName,
        headline: parsed.data.headline,
        shortBio: parsed.data.shortBio,
        bioMarkdown: parsed.data.bioMarkdown,
        experienceMarkdown: parsed.data.experienceMarkdown,
        skills: parsed.data.skills ?? Prisma.JsonNull,
        tools: parsed.data.tools ?? Prisma.JsonNull,
        contactEmail: parsed.data.contactEmail,
        location: parsed.data.location,
        websiteUrl: parsed.data.websiteUrl,
        githubUrl: parsed.data.githubUrl,
        linkedinUrl: parsed.data.linkedinUrl,
        resumeUrl: parsed.data.resumeUrl,
        avatarUrl: parsed.data.avatarUrl,
        coverImageUrl: parsed.data.coverImageUrl,
        isActive: parsed.data.isActive,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    return sendSuccess(res, requestId, profile);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to save profile page.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.patch("/profile", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = profilePageUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid profile update payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const existing = await prisma.profilePage.findFirst({
      where: parsed.data.slug ? { slug: parsed.data.slug } : undefined,
      orderBy: { updatedAt: "desc" },
    });

    if (!existing) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Profile page not found.",
        404,
      );
    }

    const userId = req.header("x-user-id") ?? null;

    const profile = await prisma.profilePage.update({
      where: { id: existing.id },
      data: {
        fullName: parsed.data.fullName,
        headline: parsed.data.headline,
        shortBio: parsed.data.shortBio,
        bioMarkdown: parsed.data.bioMarkdown,
        experienceMarkdown: parsed.data.experienceMarkdown,
        skills:
          parsed.data.skills === undefined
            ? undefined
            : (parsed.data.skills ?? Prisma.JsonNull),
        tools:
          parsed.data.tools === undefined
            ? undefined
            : (parsed.data.tools ?? Prisma.JsonNull),
        contactEmail: parsed.data.contactEmail,
        location: parsed.data.location,
        websiteUrl: parsed.data.websiteUrl,
        githubUrl: parsed.data.githubUrl,
        linkedinUrl: parsed.data.linkedinUrl,
        resumeUrl: parsed.data.resumeUrl,
        avatarUrl: parsed.data.avatarUrl,
        coverImageUrl: parsed.data.coverImageUrl,
        isActive: parsed.data.isActive,
        updatedBy: userId,
      },
    });

    return sendSuccess(res, requestId, profile);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to update profile page.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.get("/blog/tags", async (_req, res) => {
  const requestId = getRequestId(res);

  try {
    const tags = await prisma.blogTag.findMany({
      orderBy: [{ name: "asc" }],
      include: {
        _count: {
          select: {
            posts: true,
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
      "Failed to fetch blog tags.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.post("/blog/tags", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = blogTagCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid blog tag payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const slug = await generateUniqueBlogTagSlug(
      parsed.data.slug ?? parsed.data.name,
    );

    const tag = await prisma.blogTag.create({
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
      "Failed to create blog tag.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.patch("/blog/tags/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = pageIdSchema.safeParse(req.params);
    if (!parsedId.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid id.",
        400,
      );
    }

    const parsed = blogTagUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid blog tag update payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const nextSlug =
      parsed.data.slug || parsed.data.name
        ? await generateUniqueBlogTagSlug(
            parsed.data.slug ?? parsed.data.name ?? "tag",
            parsedId.data.id,
          )
        : undefined;

    const tag = await prisma.blogTag.update({
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
      "Failed to update blog tag.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.delete("/blog/tags/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = pageIdSchema.safeParse(req.params);
    if (!parsedId.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid id.",
        400,
      );
    }

    await prisma.blogTag.delete({
      where: { id: parsedId.data.id },
    });

    return sendSuccess(res, requestId, { deleted: true });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to delete blog tag.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.get("/blog/posts", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = blogListQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid blog posts query.",
        400,
        parsed.error.flatten(),
      );
    }

    const where: Prisma.BlogPostWhereInput = parsed.data.status
      ? { status: parsed.data.status as BlogPostStatus }
      : {};

    const items = await prisma.blogPost.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      take: parsed.data.limit + 1,
      ...(parsed.data.cursor
        ? {
            cursor: { id: parsed.data.cursor },
            skip: 1,
          }
        : {}),
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    const hasMore = items.length > parsed.data.limit;
    const pageItems = hasMore ? items.slice(0, parsed.data.limit) : items;
    const nextCursor = hasMore
      ? (pageItems[pageItems.length - 1]?.id ?? null)
      : null;

    return sendSuccess(res, requestId, {
      items: pageItems.map((item) => ({
        ...item,
        tags: item.tags.map((entry) => entry.tag),
      })),
      pagination: {
        limit: parsed.data.limit,
        nextCursor,
        hasMore,
      },
    });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch blog posts.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.post("/blog/posts", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = blogPostCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid blog post payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const userId = req.header("x-user-id") ?? null;

    const post = await prisma.blogPost.create({
      data: {
        slug: parsed.data.slug,
        title: parsed.data.title,
        excerpt: parsed.data.excerpt,
        contentMarkdown: parsed.data.contentMarkdown,
        status: parsed.data.status,
        publishAt: parsed.data.publishAt,
        publishedAt:
          parsed.data.status === BlogPostStatus.PUBLISHED ? new Date() : null,
        authorId: parsed.data.authorId ?? userId,
        createdBy: userId,
        updatedBy: userId,
        tags: {
          create: parsed.data.tagIds.map((tagId) => ({
            tagId,
          })),
        },
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return sendSuccess(
      res,
      requestId,
      {
        ...post,
        tags: post.tags.map((entry) => entry.tag),
      },
      201,
    );
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to create blog post.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.put("/blog/posts/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = pageIdSchema.safeParse(req.params);
    if (!parsedId.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid id.",
        400,
      );
    }

    const parsed = blogPostUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid blog post update payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const existing = await prisma.blogPost.findUnique({
      where: { id: parsedId.data.id },
      select: { id: true, status: true },
    });

    if (!existing) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Blog post not found.",
        404,
      );
    }

    const userId = req.header("x-user-id") ?? null;

    const post = await prisma.blogPost.update({
      where: { id: parsedId.data.id },
      data: {
        slug: parsed.data.slug,
        title: parsed.data.title,
        excerpt: parsed.data.excerpt,
        contentMarkdown: parsed.data.contentMarkdown,
        status: parsed.data.status,
        publishAt: parsed.data.publishAt,
        publishedAt:
          parsed.data.status === BlogPostStatus.PUBLISHED &&
          existing.status !== BlogPostStatus.PUBLISHED
            ? new Date()
            : parsed.data.status === BlogPostStatus.DRAFT
              ? null
              : undefined,
        authorId: parsed.data.authorId,
        updatedBy: userId,
      },
    });

    const tagIds = parsed.data.tagIds;

    if (tagIds) {
      await prisma.$transaction(async (tx) => {
        await tx.blogPostTag.deleteMany({
          where: { postId: parsedId.data.id },
        });

        if (tagIds.length > 0) {
          await tx.blogPostTag.createMany({
            data: tagIds.map((tagId) => ({
              postId: parsedId.data.id,
              tagId,
            })),
            skipDuplicates: true,
          });
        }
      });
    }

    const hydrated = await prisma.blogPost.findUnique({
      where: { id: parsedId.data.id },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    return sendSuccess(res, requestId, {
      ...post,
      tags: hydrated?.tags.map((entry) => entry.tag) ?? [],
    });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to update blog post.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.post("/blog/posts/:id/publish", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = pageIdSchema.safeParse(req.params);
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

    const post = await prisma.blogPost.update({
      where: { id: parsedId.data.id },
      data: {
        status: BlogPostStatus.PUBLISHED,
        publishAt: new Date(),
        publishedAt: new Date(),
        updatedBy: userId,
      },
    });

    return sendSuccess(res, requestId, post);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to publish blog post.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.delete("/blog/posts/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = pageIdSchema.safeParse(req.params);
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

    const post = await prisma.blogPost.update({
      where: { id: parsedId.data.id },
      data: {
        status: BlogPostStatus.ARCHIVED,
        updatedBy: userId,
      },
    });

    return sendSuccess(res, requestId, post);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to archive blog post.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.patch("/blog/comments/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = pageIdSchema.safeParse(req.params);
    if (!parsedId.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid id.",
        400,
      );
    }

    const parsed = blogCommentModerationSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid blog comment moderation payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const comment = await prisma.blogComment.update({
      where: { id: parsedId.data.id },
      data: {
        isApproved: parsed.data.isApproved,
      },
    });

    return sendSuccess(res, requestId, comment);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to moderate blog comment.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.get("/help/categories", async (_req, res) => {
  const requestId = getRequestId(res);

  try {
    const categories = await prisma.helpCategory.findMany({
      orderBy: [{ orderIndex: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: {
            articles: true,
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
      "Failed to fetch help categories.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.post("/help/categories", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = helpCategoryCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid help category payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const category = await prisma.helpCategory.create({
      data: parsed.data,
    });

    return sendSuccess(res, requestId, category, 201);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to create help category.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.patch("/help/categories/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = pageIdSchema.safeParse(req.params);
    if (!parsedId.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid id.",
        400,
      );
    }

    const parsed = helpCategoryUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid help category update payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const category = await prisma.helpCategory.update({
      where: { id: parsedId.data.id },
      data: parsed.data,
    });

    return sendSuccess(res, requestId, category);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to update help category.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.delete("/help/categories/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = pageIdSchema.safeParse(req.params);
    if (!parsedId.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid id.",
        400,
      );
    }

    const category = await prisma.helpCategory.update({
      where: { id: parsedId.data.id },
      data: {
        isActive: false,
      },
    });

    return sendSuccess(res, requestId, category);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to disable help category.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.get("/help/articles", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = helpListQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid help articles query.",
        400,
        parsed.error.flatten(),
      );
    }

    const where: Prisma.HelpArticleWhereInput = parsed.data.status
      ? { status: parsed.data.status as HelpArticleStatus }
      : {};

    const items = await prisma.helpArticle.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      take: parsed.data.limit + 1,
      ...(parsed.data.cursor
        ? {
            cursor: { id: parsed.data.cursor },
            skip: 1,
          }
        : {}),
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    const hasMore = items.length > parsed.data.limit;
    const pageItems = hasMore ? items.slice(0, parsed.data.limit) : items;
    const nextCursor = hasMore
      ? (pageItems[pageItems.length - 1]?.id ?? null)
      : null;

    return sendSuccess(res, requestId, {
      items: pageItems,
      pagination: {
        limit: parsed.data.limit,
        nextCursor,
        hasMore,
      },
    });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch help articles.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.post("/help/articles", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = helpArticleCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid help article payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const userId = req.header("x-user-id") ?? null;

    const article = await prisma.helpArticle.create({
      data: {
        categoryId: parsed.data.categoryId,
        slug: parsed.data.slug,
        title: parsed.data.title,
        summary: parsed.data.summary,
        contentMarkdown: parsed.data.contentMarkdown,
        status: parsed.data.status,
        isFeatured: parsed.data.isFeatured,
        publishAt: parsed.data.publishAt,
        publishedAt:
          parsed.data.status === HelpArticleStatus.PUBLISHED
            ? new Date()
            : null,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    return sendSuccess(res, requestId, article, 201);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to create help article.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.put("/help/articles/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = pageIdSchema.safeParse(req.params);
    if (!parsedId.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid id.",
        400,
      );
    }

    const parsed = helpArticleUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid help article update payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const existing = await prisma.helpArticle.findUnique({
      where: { id: parsedId.data.id },
      select: { id: true, status: true },
    });

    if (!existing) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Help article not found.",
        404,
      );
    }

    const userId = req.header("x-user-id") ?? null;

    const article = await prisma.helpArticle.update({
      where: { id: parsedId.data.id },
      data: {
        categoryId: parsed.data.categoryId,
        slug: parsed.data.slug,
        title: parsed.data.title,
        summary: parsed.data.summary,
        contentMarkdown: parsed.data.contentMarkdown,
        status: parsed.data.status,
        isFeatured: parsed.data.isFeatured,
        publishAt: parsed.data.publishAt,
        publishedAt:
          parsed.data.status === HelpArticleStatus.PUBLISHED &&
          existing.status !== HelpArticleStatus.PUBLISHED
            ? new Date()
            : parsed.data.status === HelpArticleStatus.DRAFT
              ? null
              : undefined,
        updatedBy: userId,
      },
    });

    return sendSuccess(res, requestId, article);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to update help article.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.post("/help/articles/:id/publish", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = pageIdSchema.safeParse(req.params);
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

    const article = await prisma.helpArticle.update({
      where: { id: parsedId.data.id },
      data: {
        status: HelpArticleStatus.PUBLISHED,
        publishAt: new Date(),
        publishedAt: new Date(),
        updatedBy: userId,
      },
    });

    return sendSuccess(res, requestId, article);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to publish help article.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.delete("/help/articles/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = pageIdSchema.safeParse(req.params);
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

    const article = await prisma.helpArticle.update({
      where: { id: parsedId.data.id },
      data: {
        status: HelpArticleStatus.ARCHIVED,
        updatedBy: userId,
      },
    });

    return sendSuccess(res, requestId, article);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to archive help article.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.get("/testimonials", async (_req, res) => {
  const requestId = getRequestId(res);

  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    });

    return sendSuccess(res, requestId, testimonials);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch testimonials.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.post("/testimonials", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = testimonialCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid testimonial payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const userId = req.header("x-user-id") ?? null;

    const testimonial = await prisma.testimonial.create({
      data: {
        authorName: parsed.data.authorName,
        authorRole: parsed.data.authorRole,
        company: parsed.data.company,
        avatarUrl: parsed.data.avatarUrl,
        quoteMarkdown: parsed.data.quoteMarkdown,
        rating: parsed.data.rating,
        sourceUrl: parsed.data.sourceUrl,
        sortOrder: parsed.data.sortOrder,
        isFeatured: parsed.data.isFeatured,
        isActive: parsed.data.isActive,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    return sendSuccess(res, requestId, testimonial, 201);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to create testimonial.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.patch("/testimonials/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = pageIdSchema.safeParse(req.params);
    if (!parsedId.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid id.",
        400,
      );
    }

    const parsed = testimonialUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid testimonial update payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const userId = req.header("x-user-id") ?? null;

    const testimonial = await prisma.testimonial.update({
      where: { id: parsedId.data.id },
      data: {
        authorName: parsed.data.authorName,
        authorRole: parsed.data.authorRole,
        company: parsed.data.company,
        avatarUrl: parsed.data.avatarUrl,
        quoteMarkdown: parsed.data.quoteMarkdown,
        rating: parsed.data.rating,
        sourceUrl: parsed.data.sourceUrl,
        sortOrder: parsed.data.sortOrder,
        isFeatured: parsed.data.isFeatured,
        isActive: parsed.data.isActive,
        updatedBy: userId,
      },
    });

    return sendSuccess(res, requestId, testimonial);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to update testimonial.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminContentRouter.delete("/testimonials/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedId = pageIdSchema.safeParse(req.params);
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

    const testimonial = await prisma.testimonial.update({
      where: { id: parsedId.data.id },
      data: {
        isActive: false,
        updatedBy: userId,
      },
    });

    return sendSuccess(res, requestId, testimonial);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to disable testimonial.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});
