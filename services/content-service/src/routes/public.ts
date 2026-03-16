import {
  BlogPostStatus,
  ContentStatus,
  HelpArticleStatus,
  Prisma,
  prisma,
} from "@elsesourav/db";
import { blogCommentCreateSchema } from "@elsesourav/validation";
import { Router } from "express";
import { z } from "zod";
import { getRequestId, sendFailure, sendSuccess } from "../lib/http";

const contentSlugSchema = z.object({
  slug: z.string().trim().min(2).max(100),
});

const contentQuerySchema = z.object({
  preview: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
});

const profileQuerySchema = z.object({
  slug: z.string().trim().min(2).max(100).optional(),
});

const blogListQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  tag: z.string().trim().max(80).optional(),
  cursor: z.string().cuid().optional(),
  limit: z.coerce.number().int().min(1).max(24).default(10),
  preview: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
});

const helpArticlesQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  categorySlug: z.string().trim().max(120).optional(),
  featured: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value ? value === "true" : undefined)),
  cursor: z.string().cuid().optional(),
  limit: z.coerce.number().int().min(1).max(30).default(12),
});

const testimonialsQuerySchema = z.object({
  featuredOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  limit: z.coerce.number().int().min(1).max(40).default(12),
});

export const publicContentRouter = Router();

publicContentRouter.get("/profile", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = profileQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid profile query.",
        400,
        parsed.error.flatten(),
      );
    }

    const profile = parsed.data.slug
      ? await prisma.profilePage.findFirst({
          where: {
            slug: parsed.data.slug,
            isActive: true,
          },
        })
      : await prisma.profilePage.findFirst({
          where: { isActive: true },
          orderBy: { updatedAt: "desc" },
        });

    if (!profile) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Profile page not found.",
        404,
      );
    }

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

publicContentRouter.get("/blog/tags", async (_req, res) => {
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

publicContentRouter.get("/blog/posts", async (req, res) => {
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

    const now = new Date();
    const isPreview =
      parsed.data.preview && req.header("x-user-role") === "ADMIN";

    const where: Prisma.BlogPostWhereInput = {};

    if (!isPreview) {
      where.status = BlogPostStatus.PUBLISHED;
      where.AND = [{ OR: [{ publishAt: null }, { publishAt: { lte: now } }] }];
    }

    if (parsed.data.search) {
      where.OR = [
        {
          title: {
            contains: parsed.data.search,
            mode: "insensitive",
          },
        },
        {
          excerpt: {
            contains: parsed.data.search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (parsed.data.tag) {
      where.tags = {
        some: {
          tag: {
            OR: [
              {
                slug: parsed.data.tag.toLowerCase(),
              },
              {
                name: {
                  contains: parsed.data.tag,
                  mode: "insensitive",
                },
              },
            ],
          },
        },
      };
    }

    const items = await prisma.blogPost.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }, { id: "desc" }],
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
        tags: item.tags.map((tagLink) => tagLink.tag),
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

publicContentRouter.get("/blog/posts/:slug", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedSlug = contentSlugSchema.safeParse(req.params);
    if (!parsedSlug.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid slug.",
        400,
      );
    }

    const now = new Date();
    const isPreview =
      req.query.preview === "true" && req.header("x-user-role") === "ADMIN";

    const post = await prisma.blogPost.findUnique({
      where: { slug: parsedSlug.data.slug },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        comments: {
          where: isPreview ? undefined : { isApproved: true },
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Blog post not found.",
        404,
      );
    }

    if (!isPreview) {
      const isPublished = post.status === BlogPostStatus.PUBLISHED;
      const withinWindow = !post.publishAt || post.publishAt <= now;
      if (!isPublished || !withinWindow) {
        return sendFailure(
          res,
          requestId,
          "NOT_FOUND",
          "Blog post not found.",
          404,
        );
      }
    }

    return sendSuccess(res, requestId, {
      ...post,
      tags: post.tags.map((tagLink) => tagLink.tag),
    });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch blog post.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

publicContentRouter.post("/blog/posts/:slug/comments", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedSlug = contentSlugSchema.safeParse(req.params);
    if (!parsedSlug.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid slug.",
        400,
      );
    }

    const parsedBody = blogCommentCreateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid blog comment payload.",
        400,
        parsedBody.error.flatten(),
      );
    }

    const post = await prisma.blogPost.findUnique({
      where: { slug: parsedSlug.data.slug },
      select: {
        id: true,
        status: true,
        publishAt: true,
      },
    });

    if (!post) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Blog post not found.",
        404,
      );
    }

    const isPublished = post.status === BlogPostStatus.PUBLISHED;
    const withinWindow = !post.publishAt || post.publishAt <= new Date();
    if (!isPublished || !withinWindow) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Blog post not found.",
        404,
      );
    }

    const userId = req.header("x-user-id") ?? null;

    const comment = await prisma.blogComment.create({
      data: {
        postId: post.id,
        userId,
        authorName: parsedBody.data.authorName,
        authorEmail: parsedBody.data.authorEmail,
        content: parsedBody.data.content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return sendSuccess(res, requestId, comment, 201);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to submit blog comment.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

publicContentRouter.get("/help/categories", async (_req, res) => {
  const requestId = getRequestId(res);

  try {
    const categories = await prisma.helpCategory.findMany({
      where: { isActive: true },
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

publicContentRouter.get("/help/articles", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = helpArticlesQuerySchema.safeParse(req.query);
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

    const now = new Date();
    const where: Prisma.HelpArticleWhereInput = {
      status: HelpArticleStatus.PUBLISHED,
      AND: [{ OR: [{ publishAt: null }, { publishAt: { lte: now } }] }],
    };

    if (parsed.data.search) {
      where.OR = [
        {
          title: {
            contains: parsed.data.search,
            mode: "insensitive",
          },
        },
        {
          summary: {
            contains: parsed.data.search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (parsed.data.featured !== undefined) {
      where.isFeatured = parsed.data.featured;
    }

    if (parsed.data.categorySlug) {
      where.category = {
        slug: parsed.data.categorySlug,
      };
    }

    const items = await prisma.helpArticle.findMany({
      where,
      orderBy: [
        { isFeatured: "desc" },
        { publishedAt: "desc" },
        { id: "desc" },
      ],
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

publicContentRouter.get("/help/articles/:slug", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedSlug = contentSlugSchema.safeParse(req.params);
    if (!parsedSlug.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid slug.",
        400,
      );
    }

    const article = await prisma.helpArticle.findUnique({
      where: { slug: parsedSlug.data.slug },
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

    if (!article) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Help article not found.",
        404,
      );
    }

    const isPublished = article.status === HelpArticleStatus.PUBLISHED;
    const withinWindow = !article.publishAt || article.publishAt <= new Date();
    if (!isPublished || !withinWindow) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Help article not found.",
        404,
      );
    }

    await prisma.helpArticle.update({
      where: { id: article.id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return sendSuccess(res, requestId, article);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch help article.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

publicContentRouter.get("/testimonials", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = testimonialsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid testimonials query.",
        400,
        parsed.error.flatten(),
      );
    }

    const testimonials = await prisma.testimonial.findMany({
      where: {
        isActive: true,
        ...(parsed.data.featuredOnly ? { isFeatured: true } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      take: parsed.data.limit,
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

publicContentRouter.get("/pages/:slug", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedSlug = contentSlugSchema.safeParse(req.params);
    if (!parsedSlug.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid slug.",
        400,
      );
    }

    const parsedQuery = contentQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid query.",
        400,
        parsedQuery.error.flatten(),
      );
    }

    const now = new Date();
    const isPreview =
      parsedQuery.data.preview && req.header("x-user-role") === "ADMIN";

    const page = await prisma.contentPage.findUnique({
      where: { slug: parsedSlug.data.slug },
      include: {
        versions: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });

    if (!page) {
      return sendFailure(res, requestId, "NOT_FOUND", "Page not found.", 404);
    }

    if (!isPreview) {
      const isPublished = page.status === ContentStatus.PUBLISHED;
      const hasPublishWindow = !page.publishAt || page.publishAt <= now;
      if (!isPublished || !hasPublishWindow) {
        return sendFailure(res, requestId, "NOT_FOUND", "Page not found.", 404);
      }
    }

    return sendSuccess(res, requestId, page);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch content page.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});
