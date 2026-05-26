import {
  PostStatus,
  ContentStatus,
  HelpArticleStatus,
  Prisma,
  prisma,
} from "@elsesourav/db";
import { 
  postCommentCreateSchema,
  postReactionToggleSchema 
} from "@elsesourav/validation";
import { Router } from "express";
import { z } from "zod";
import { getRequestId, sendFailure, sendSuccess } from "../lib/http";
import { ProfileController } from "../controllers/profile.controller";

const contentSlugSchema = z.object({
  slug: z.string().trim().min(2).max(100),
});

const contentQuerySchema = z.object({
  preview: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
});

const contentPagesQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  cursor: z.string().cuid().optional(),
  limit: z.coerce.number().int().min(1).max(30).default(12),
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

const relatedBlogPostsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(12).default(4),
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

const helpSearchQuerySchema = z.object({
  q: z.string().trim().min(2).max(120),
  limit: z.coerce.number().int().min(1).max(30).default(12),
});

const supportOverviewQuerySchema = z.object({
  categoryLimit: z.coerce.number().int().min(1).max(12).default(6),
  featuredHelpLimit: z.coerce.number().int().min(1).max(12).default(5),
  latestPostsLimit: z.coerce.number().int().min(1).max(12).default(4),
});

export const publicContentRouter = Router();

const profileController = new ProfileController();
publicContentRouter.get("/profile", profileController.getProfile);

publicContentRouter.get("/posts/tags", async (_req, res) => {
  const requestId = getRequestId(res);

  try {
    const tags = await prisma.postTag.findMany({
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

publicContentRouter.get("/posts", async (req, res) => {
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

    const where: Prisma.PostWhereInput = {};

    if (!isPreview) {
      where.status = PostStatus.PUBLISHED;
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

    const items = await prisma.post.findMany({
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

publicContentRouter.get("/posts/:slug", async (req, res) => {
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

    const post = await prisma.post.findUnique({
      where: { slug: parsedSlug.data.slug },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            comments: {
              where: isPreview ? undefined : { isApproved: true },
            }
          }
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
      const isPublished = post.status === PostStatus.PUBLISHED;
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

publicContentRouter.get("/posts/:slug/related", async (req, res) => {
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

    const parsedQuery = relatedBlogPostsQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid related posts query.",
        400,
        parsedQuery.error.flatten(),
      );
    }

    const post = await prisma.post.findUnique({
      where: { slug: parsedSlug.data.slug },
      select: {
        id: true,
        tags: {
          select: {
            tagId: true,
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

    const now = new Date();
    const tagIds = post.tags.map((item) => item.tagId);

    const related = await prisma.post.findMany({
      where: {
        id: { not: post.id },
        status: PostStatus.PUBLISHED,
        AND: [{ OR: [{ publishAt: null }, { publishAt: { lte: now } }] }],
        ...(tagIds.length > 0
          ? {
              tags: {
                some: {
                  tagId: {
                    in: tagIds,
                  },
                },
              },
            }
          : {}),
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: parsedQuery.data.limit,
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

    const existingIds = new Set(related.map((item) => item.id));

    if (related.length < parsedQuery.data.limit) {
      const remainder = parsedQuery.data.limit - related.length;

      const fallback = await prisma.post.findMany({
        where: {
          id: {
            notIn: [post.id, ...existingIds],
          },
          status: PostStatus.PUBLISHED,
          AND: [{ OR: [{ publishAt: null }, { publishAt: { lte: now } }] }],
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: remainder,
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

      related.push(...fallback);
    }

    return sendSuccess(res, requestId, {
      items: related.map((item) => ({
        ...item,
        tags: item.tags.map((tagLink) => tagLink.tag),
      })),
    });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch related blog posts.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

publicContentRouter.post("/posts/:slug/comments", async (req, res) => {
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

    const parsedBody = postCommentCreateSchema.safeParse(req.body);
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

    const post = await prisma.post.findUnique({
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

    const isPublished = post.status === PostStatus.PUBLISHED;
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

    const rawUserId = req.header("x-user-id") ?? null;
    let userId = rawUserId;
    let dbUser: { id: string; name: string | null; role: string } | null = null;

    if (rawUserId) {
      dbUser = await prisma.user.findUnique({
        where: { id: rawUserId },
        select: { id: true, name: true, role: true }
      });
      if (!dbUser) {
        userId = null;
      }
    }

    let finalAuthorName = parsedBody.data.authorName;
    if (dbUser) {
      if (dbUser.name) {
        finalAuthorName = dbUser.name;
      } else if (dbUser.role === "ADMIN") {
        finalAuthorName = "Admin";
      } else {
        finalAuthorName = "User";
      }
    }

    const comment = await prisma.postComment.create({
      data: {
        postId: post.id,
        parentId: parsedBody.data.parentId || null,
        userId,
        authorName: finalAuthorName,
        authorEmail: parsedBody.data.authorEmail,
        content: parsedBody.data.content,
        isGuest: !userId,
        isApproved: true, // Auto-approve all comments to prevent persistence bugs
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
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

publicContentRouter.get("/posts/:slug/comments", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedSlug = contentSlugSchema.safeParse(req.params);
    if (!parsedSlug.success) {
      return sendFailure(res, requestId, "VALIDATION_ERROR", "Invalid slug.", 400);
    }

    const post = await prisma.post.findUnique({
      where: { slug: parsedSlug.data.slug },
      select: { id: true, status: true, publishAt: true },
    });

    if (!post) {
      return sendFailure(res, requestId, "NOT_FOUND", "Blog post not found.", 404);
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const cursor = req.query.cursor as string | undefined;
    const sort = req.query.sort as string || "newest";

    let orderBy: any = { createdAt: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };
    if (sort === "liked") orderBy = [{ likesCount: "desc" }, { createdAt: "desc" }];

    const baseWhere = {
      postId: post.id,
      parentId: null, // Only fetch root comments directly
      OR: [
        { isApproved: true },
        ...(req.header("x-user-id") ? [{ userId: req.header("x-user-id") }] : []),
      ]
    };

    const userId = req.header("x-user-id") ?? null;
    const sessionId = req.header("x-session-id") ?? null;

    const authConditions = [];
    if (userId) authConditions.push({ userId });
    if (sessionId) authConditions.push({ sessionId });
    // dummy condition if no auth to prevent fetching all reactions
    if (authConditions.length === 0) authConditions.push({ id: "unmatched" });

    const rootComments = await prisma.postComment.findMany({
      where: baseWhere,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy,
      include: {
        user: { select: { id: true, name: true, image: true, role: true } },
        reactions: { where: { OR: authConditions }, select: { id: true } },
        replies: {
          where: {
            OR: [
              { isApproved: true },
              ...(req.header("x-user-id") ? [{ userId: req.header("x-user-id") }] : []),
            ]
          },
          orderBy: { createdAt: "asc" }, // Replies always oldest first
          include: {
            user: { select: { id: true, name: true, image: true, role: true } },
            reactions: { where: { OR: authConditions }, select: { id: true } },
            replies: {
              where: {
                OR: [
                  { isApproved: true },
                  ...(req.header("x-user-id") ? [{ userId: req.header("x-user-id") }] : []),
                ]
              },
              orderBy: { createdAt: "asc" },
              include: {
                user: { select: { id: true, name: true, image: true, role: true } },
                reactions: { where: { OR: authConditions }, select: { id: true } }
              }
            }
          }
        }
      },
    });

    const hasMore = rootComments.length > limit;
    const items = hasMore ? rootComments.slice(0, -1) : rootComments;
    const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;

    return sendSuccess(res, requestId, {
      items,
      pagination: {
        hasMore,
        nextCursor,
        limit,
      }
    });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

publicContentRouter.get("/posts/:slug/reactions", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedSlug = contentSlugSchema.safeParse(req.params);
    if (!parsedSlug.success) {
      return sendFailure(res, requestId, "VALIDATION_ERROR", "Invalid slug.", 400);
    }

    const post = await prisma.post.findUnique({
      where: { slug: parsedSlug.data.slug },
      select: { id: true },
    });

    if (!post) {
      return sendFailure(res, requestId, "NOT_FOUND", "Blog post not found.", 404);
    }

    const reactions = await prisma.postReaction.groupBy({
      by: ['type'],
      where: { postId: post.id },
      _count: true,
    });

    const commentsCount = await prisma.postComment.count({
      where: { postId: post.id, isApproved: true }
    });

    const userId = req.header("x-user-id") ?? null;
    const sessionId = req.header("x-session-id") ?? null;
    let userReaction = null;

    if (userId || sessionId) {
      const userReact = await prisma.postReaction.findFirst({
        where: { postId: post.id, OR: [{ userId }, { sessionId }] },
      });
      if (userReact) userReaction = userReact.type;
    }

    return sendSuccess(res, requestId, {
      counts: {
        ...reactions.reduce((acc, curr) => {
          acc[curr.type] = curr._count;
          return acc;
        }, {} as Record<string, number>),
        comments: commentsCount,
      },
      userReaction,
    });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch reactions.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

publicContentRouter.post("/posts/:slug/reactions", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const rawUserId = req.header("x-user-id") ?? null;
    const sessionId = req.header("x-session-id") ?? null;
    
    let userId = rawUserId;
    if (rawUserId) {
      const userExists = await prisma.user.findUnique({
        where: { id: rawUserId },
        select: { id: true }
      });
      if (!userExists) userId = null;
    }

    if (!userId && !sessionId) {
      return sendFailure(res, requestId, "UNAUTHORIZED", "Authentication or session required.", 401);
    }

    const parsedSlug = contentSlugSchema.safeParse(req.params);
    const parsedBody = postReactionToggleSchema.safeParse(req.body);

    if (!parsedSlug.success || !parsedBody.success) {
      return sendFailure(res, requestId, "VALIDATION_ERROR", "Invalid payload.", 400);
    }

    const post = await prisma.post.findUnique({
      where: { slug: parsedSlug.data.slug },
      select: { id: true },
    });

    if (!post) {
      return sendFailure(res, requestId, "NOT_FOUND", "Blog post not found.", 404);
    }

    const authConditions = [];
    if (userId) authConditions.push({ userId });
    if (sessionId) authConditions.push({ sessionId });

    const existingReaction = await prisma.postReaction.findFirst({
      where: { postId: post.id, type: parsedBody.data.type, OR: authConditions },
    });

    if (existingReaction) {
      await prisma.postReaction.delete({ where: { id: existingReaction.id } });
      return sendSuccess(res, requestId, { active: false });
    } else {
      await prisma.postReaction.create({
        data: { postId: post.id, userId, sessionId, type: parsedBody.data.type },
      });
      return sendSuccess(res, requestId, { active: true });
    }
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to toggle reaction.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

publicContentRouter.get("/posts/:slug/bookmarks/status", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const userId = req.header("x-user-id");
    if (!userId) {
      return sendSuccess(res, requestId, { isBookmarked: false });
    }

    const parsedSlug = contentSlugSchema.safeParse(req.params);
    if (!parsedSlug.success) {
      return sendFailure(res, requestId, "VALIDATION_ERROR", "Invalid slug.", 400);
    }

    const post = await prisma.post.findUnique({
      where: { slug: parsedSlug.data.slug },
      select: { id: true },
    });

    if (!post) {
      return sendFailure(res, requestId, "NOT_FOUND", "Blog post not found.", 404);
    }

    const bookmark = await prisma.postBookmark.findFirst({
      where: { postId: post.id, userId },
    });

    return sendSuccess(res, requestId, { isBookmarked: !!bookmark });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch bookmark status.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

publicContentRouter.post("/posts/:slug/bookmarks", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const rawUserId = req.header("x-user-id");
    let userId = rawUserId;
    if (rawUserId) {
      const userExists = await prisma.user.findUnique({
        where: { id: rawUserId },
        select: { id: true }
      });
      if (!userExists) userId = undefined;
    }

    if (!userId) {
      return sendFailure(res, requestId, "UNAUTHORIZED", "Authentication required.", 401);
    }

    const parsedSlug = contentSlugSchema.safeParse(req.params);
    if (!parsedSlug.success) {
      return sendFailure(res, requestId, "VALIDATION_ERROR", "Invalid slug.", 400);
    }

    const post = await prisma.post.findUnique({
      where: { slug: parsedSlug.data.slug },
      select: { id: true },
    });

    if (!post) {
      return sendFailure(res, requestId, "NOT_FOUND", "Blog post not found.", 404);
    }

    const existingBookmark = await prisma.postBookmark.findFirst({
      where: { postId: post.id, userId },
    });

    if (existingBookmark) {
      await prisma.postBookmark.delete({ where: { id: existingBookmark.id } });
      return sendSuccess(res, requestId, { isBookmarked: false });
    } else {
      await prisma.postBookmark.create({
        data: { postId: post.id, userId },
      });
      return sendSuccess(res, requestId, { isBookmarked: true });
    }
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to toggle bookmark.",
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

publicContentRouter.get("/help/search", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = helpSearchQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid help search query.",
        400,
        parsed.error.flatten(),
      );
    }

    const now = new Date();

    const items = await prisma.helpArticle.findMany({
      where: {
        status: HelpArticleStatus.PUBLISHED,
        AND: [{ OR: [{ publishAt: null }, { publishAt: { lte: now } }] }],
        OR: [
          {
            title: {
              contains: parsed.data.q,
              mode: "insensitive",
            },
          },
          {
            summary: {
              contains: parsed.data.q,
              mode: "insensitive",
            },
          },
          {
            contentMarkdown: {
              contains: parsed.data.q,
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: [
        { isFeatured: "desc" },
        { viewCount: "desc" },
        { publishedAt: "desc" },
      ],
      take: parsed.data.limit,
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

    const categoryCounts = new Map<
      string,
      { id: string; slug: string; name: string; count: number }
    >();

    for (const item of items) {
      if (!item.category) {
        continue;
      }

      const previous = categoryCounts.get(item.category.id);
      categoryCounts.set(item.category.id, {
        id: item.category.id,
        slug: item.category.slug,
        name: item.category.name,
        count: (previous?.count ?? 0) + 1,
      });
    }

    return sendSuccess(res, requestId, {
      query: parsed.data.q,
      items,
      categories: Array.from(categoryCounts.values()).sort(
        (a, b) => b.count - a.count,
      ),
    });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to search help articles.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

publicContentRouter.get("/support/overview", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = supportOverviewQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid support overview query.",
        400,
        parsed.error.flatten(),
      );
    }

    const now = new Date();

    const [categories, featuredHelp, latestPosts] = await Promise.all([
      prisma.helpCategory.findMany({
        where: { isActive: true },
        orderBy: [{ orderIndex: "asc" }, { name: "asc" }],
        take: parsed.data.categoryLimit,
        include: {
          _count: {
            select: {
              articles: true,
            },
          },
        },
      }),
      prisma.helpArticle.findMany({
        where: {
          status: HelpArticleStatus.PUBLISHED,
          isFeatured: true,
          AND: [{ OR: [{ publishAt: null }, { publishAt: { lte: now } }] }],
        },
        orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
        take: parsed.data.featuredHelpLimit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.post.findMany({
        where: {
          status: PostStatus.PUBLISHED,
          AND: [{ OR: [{ publishAt: null }, { publishAt: { lte: now } }] }],
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: parsed.data.latestPostsLimit,
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
      }),
    ]);

    return sendSuccess(res, requestId, {
      categories,
      featuredHelp,
      latestPosts: latestPosts.map((item) => ({
        ...item,
        tags: item.tags.map((tagLink) => tagLink.tag),
      })),
    });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch support overview.",
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

publicContentRouter.get("/pages", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = contentPagesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid content pages query.",
        400,
        parsed.error.flatten(),
      );
    }

    const now = new Date();
    const isPreview =
      parsed.data.preview && req.header("x-user-role") === "ADMIN";

    const where: Prisma.ContentPageWhereInput = {};

    if (!isPreview) {
      where.status = ContentStatus.PUBLISHED;
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
          summary: {
            contains: parsed.data.search,
            mode: "insensitive",
          },
        },
      ];
    }

    const items = await prisma.contentPage.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }, { id: "desc" }],
      take: parsed.data.limit + 1,
      ...(parsed.data.cursor
        ? {
            cursor: { id: parsed.data.cursor },
            skip: 1,
          }
        : {}),
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        body: true,
        status: true,
        publishAt: true,
        publishedAt: true,
        updatedAt: true,
        metadata: true,
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
      "Failed to fetch content pages.",
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

publicContentRouter.post("/posts/:slug/comments/:commentId/like", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const rawUserId = req.header("x-user-id") ?? null;
    const sessionId = req.header("x-session-id") ?? null;
    
    let userId = rawUserId;
    if (rawUserId) {
      const userExists = await prisma.user.findUnique({
        where: { id: rawUserId },
        select: { id: true }
      });
      if (!userExists) userId = null;
    }

    if (!userId && !sessionId) {
      return sendFailure(res, requestId, "UNAUTHORIZED", "Authentication or session required.", 401);
    }

    const { slug, commentId } = req.params;

    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!post) {
      return sendFailure(res, requestId, "NOT_FOUND", "Post not found.", 404);
    }

    const comment = await prisma.postComment.findUnique({
      where: { id: commentId, postId: post.id }
    });

    if (!comment) {
      return sendFailure(res, requestId, "NOT_FOUND", "Comment not found.", 404);
    }

    const authConditions = [];
    if (userId) authConditions.push({ userId });
    if (sessionId) authConditions.push({ sessionId });

    const existingReaction = await prisma.commentReaction.findFirst({
      where: { commentId, type: "like", OR: authConditions }
    });

    let updated;
    if (existingReaction) {
      await prisma.$transaction([
        prisma.commentReaction.delete({ where: { id: existingReaction.id } }),
        prisma.postComment.update({ where: { id: commentId }, data: { likesCount: { decrement: 1 } } })
      ]);
      updated = { id: commentId, likesCount: Math.max(0, comment.likesCount - 1), hasLiked: false };
    } else {
      await prisma.$transaction([
        prisma.commentReaction.create({ data: { commentId, userId, sessionId, type: "like" } }),
        prisma.postComment.update({ where: { id: commentId }, data: { likesCount: { increment: 1 } } })
      ]);
      updated = { id: commentId, likesCount: comment.likesCount + 1, hasLiked: true };
    }

    return sendSuccess(res, requestId, updated, 200);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      500,
    );
  }
});

publicContentRouter.get("/help/faqs", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const categoryId = req.query.categoryId as string | undefined;
    const appId = req.query.appId as string | undefined;

    const where: Prisma.FAQWhereInput = {};
    if (categoryId) where.categoryId = categoryId;
    if (appId) where.appId = appId;

    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: { orderIndex: "asc" },
    });

    return sendSuccess(res, requestId, faqs);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch FAQs.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});
