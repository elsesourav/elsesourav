import { getServerEnv } from "@elsesourav/config";
import { AppStatus, Prisma, prisma } from "@elsesourav/db";
import {
  appStatsRecomputeSchema,
  appViewTrackSchema,
  downloadEventSchema,
  feedbackCreateSchema,
  feedbackModerationSchema,
  libraryMutationSchema,
  recentlyViewedQuerySchema,
  supportTicketCreateSchema,
  supportTicketListQuerySchema,
  supportTicketReplyCreateSchema,
  supportTicketUpdateSchema,
  userDeletionScheduleSchema,
  userSettingsUpdateSchema,
} from "@elsesourav/validation";
import { createHash } from "crypto";
import { Router } from "express";
import { z } from "zod";
import { getRequestId, sendFailure, sendSuccess } from "../lib/http";
import { requireUserId } from "../lib/internal-auth";

const appIdParamSchema = z.object({
  appId: z.string().cuid(),
});

const feedbackIdParamSchema = z.object({
  id: z.string().cuid(),
});

const feedbackListQuerySchema = z.object({
  appId: z.string().cuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

const supportTicketIdParamSchema = z.object({
  id: z.string().cuid(),
});

const adminSupportTicketListQuerySchema = z.object({
  status: z
    .enum(["OPEN", "IN_PROGRESS", "WAITING_FOR_USER", "RESOLVED", "CLOSED"])
    .optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  appId: z.string().cuid().optional(),
  assignedToId: z.string().cuid().optional(),
  search: z.string().trim().max(120).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  userId: z.string().cuid().optional(),
  includeClosed: z.coerce.boolean().default(true),
});

const appStatsListQuerySchema = z.object({
  sort: z.enum(["views", "downloads", "rating"]).default("views"),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

type UserSettingsPayload = {
  themeMode: "system" | "light" | "dark";
  customTheme: Record<string, string> | null;
  emailNotifications: boolean;
  marketingEmails: boolean;
  updatedAt: string | null;
};

type UserDeletionSchedulePayload = {
  scheduledDeletionAt: string | null;
  deletedAt: string | null;
  isScheduled: boolean;
  minimumDelayDays: number;
  maximumDelayDays: number;
  defaultDelayDays: number;
};

type SupportTicketSummaryRow = {
  id: string;
  userId: string | null;
  appId: string | null;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string | null;
  channel: string;
  sourceUrl: string | null;
  assignedToId: string | null;
  firstResponseAt: Date | null;
  resolvedAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  appTitle: string | null;
  appSlug: string | null;
  messageCount: number;
};

type SupportTicketMessageRow = {
  id: string;
  ticketId: string;
  authorUserId: string | null;
  authorType: string;
  body: string;
  isInternal: boolean;
  attachments: Prisma.JsonValue | null;
  createdAt: Date;
  authorName: string | null;
  authorEmail: string | null;
};

const userDeletionDelayDays = {
  minimum: 7,
  maximum: 30,
  default: 14,
} as const;

export const userRouter = Router();
export const adminUserRouter = Router();
const env = getServerEnv();

function hashIp(value: string): string {
  return createHash("sha256")
    .update(`${value}:${env.NEXTAUTH_SECRET ?? "fallback-hash-secret"}`)
    .digest("hex");
}

function getUtcDayRange(date: Date) {
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

function toSettingsPayload(
  settings: {
    themeMode: string | null;
    customTheme: Prisma.JsonValue | null;
    emailNotifications: boolean;
    marketingEmails: boolean;
    updatedAt: Date;
  } | null,
): UserSettingsPayload {
  const themeMode =
    settings?.themeMode === "light" || settings?.themeMode === "dark"
      ? settings.themeMode
      : "system";

  const customTheme =
    settings?.customTheme &&
    typeof settings.customTheme === "object" &&
    !Array.isArray(settings.customTheme)
      ? (settings.customTheme as Record<string, string>)
      : null;

  return {
    themeMode,
    customTheme,
    emailNotifications: settings?.emailNotifications ?? true,
    marketingEmails: settings?.marketingEmails ?? false,
    updatedAt: settings?.updatedAt.toISOString() ?? null,
  };
}

function toDeletionSchedulePayload(user: {
  scheduledDeletionAt: Date | null;
  deletedAt: Date | null;
}): UserDeletionSchedulePayload {
  return {
    scheduledDeletionAt: user.scheduledDeletionAt?.toISOString() ?? null,
    deletedAt: user.deletedAt?.toISOString() ?? null,
    isScheduled: user.scheduledDeletionAt !== null && user.deletedAt === null,
    minimumDelayDays: userDeletionDelayDays.minimum,
    maximumDelayDays: userDeletionDelayDays.maximum,
    defaultDelayDays: userDeletionDelayDays.default,
  };
}

async function getSupportTicketById(
  ticketId: string,
  options?: {
    userId?: string;
  },
) {
  const whereClauses: any = { id: ticketId };

  if (options?.userId) {
    whereClauses.userId = options.userId;
  }

  const ticket = await prisma.supportTicket.findFirst({
    where: whereClauses,
    include: {
      app: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
  });

  if (!ticket) return null;

  return {
    ...ticket,
    appTitle: ticket.app?.title ?? null,
    appSlug: ticket.app?.slug ?? null,
  };
}

async function getSupportTicketMessages(
  ticketId: string,
  includeInternal: boolean,
) {
  return prisma.supportTicketMessage.findMany({
    where: {
      ticketId,
      ...(includeInternal ? {} : { isInternal: false }),
    },
    include: {
      authorUser: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  }).then((messages: any[]) => messages.map((m: any) => ({
    ...m,
    authorName: m.authorUser?.name ?? null,
    authorEmail: m.authorUser?.email ?? null,
  })));
}

async function recomputeAggregateStatsForApp(appId: string, date: Date) {
  const { start, end } = getUtcDayRange(date);

  const [viewCount, downloadCount, libraryCount, feedbackAggregate] =
    await prisma.$transaction([
      prisma.appViewEvent.count({ where: { appId } }),
      prisma.downloadEvent.count({ where: { appId } }),
      prisma.userLibrary.count({ where: { appId } }),
      prisma.feedback.aggregate({
        where: {
          appId,
          isHidden: false,
        },
        _count: { id: true },
        _avg: { rating: true },
      }),
    ]);

  const feedbackCount = feedbackAggregate._count.id;
  const averageRating = feedbackAggregate._avg.rating ?? 0;

  await prisma.appAggregateStat.upsert({
    where: { appId },
    update: {
      viewCount,
      downloadCount,
      libraryCount,
      feedbackCount,
      averageRating,
    },
    create: {
      appId,
      viewCount,
      downloadCount,
      libraryCount,
      feedbackCount,
      averageRating,
      lastViewedAt: viewCount > 0 ? new Date() : null,
      lastDownloadedAt: downloadCount > 0 ? new Date() : null,
    },
  });

  const [dailyViews, dailyDownloads, dailyFeedbackAggregate] =
    await prisma.$transaction([
      prisma.appViewEvent.count({
        where: {
          appId,
          createdAt: {
            gte: start,
            lt: end,
          },
        },
      }),
      prisma.downloadEvent.count({
        where: {
          appId,
          createdAt: {
            gte: start,
            lt: end,
          },
        },
      }),
      prisma.feedback.aggregate({
        where: {
          appId,
          isHidden: false,
          createdAt: {
            gte: start,
            lt: end,
          },
        },
        _count: { id: true },
        _avg: { rating: true },
      }),
    ]);

  await prisma.appDailyStat.upsert({
    where: {
      appId_date: {
        appId,
        date: start,
      },
    },
    update: {
      viewCount: dailyViews,
      downloadCount: dailyDownloads,
      libraryCount,
      feedbackCount: dailyFeedbackAggregate._count.id,
      averageRating: dailyFeedbackAggregate._avg.rating ?? 0,
    },
    create: {
      appId,
      date: start,
      viewCount: dailyViews,
      downloadCount: dailyDownloads,
      libraryCount,
      feedbackCount: dailyFeedbackAggregate._count.id,
      averageRating: dailyFeedbackAggregate._avg.rating ?? 0,
    },
  });
}

userRouter.post("/download/track", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = downloadEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid download tracking payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const app = await prisma.app.findFirst({
      where: {
        id: parsed.data.appId,
        status: AppStatus.PUBLISHED,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!app) {
      return sendFailure(res, requestId, "NOT_FOUND", "App not found.", 404);
    }

    const forwardedFor = req.header("x-forwarded-for") ?? "";
    const ip = forwardedFor.split(",")[0]?.trim();
    const ipHash = ip ? hashIp(ip) : null;

    const event = await prisma.downloadEvent.create({
      data: {
        appId: parsed.data.appId,
        platform: parsed.data.platform,
        userId: req.header("x-user-id") ?? null,
        ipHash,
        userAgent: req.header("user-agent") ?? null,
      },
      select: {
        id: true,
        appId: true,
        platform: true,
        createdAt: true,
      },
    });

    await prisma.appAggregateStat.upsert({
      where: {
        appId: parsed.data.appId,
      },
      update: {
        downloadCount: {
          increment: 1,
        },
        lastDownloadedAt: event.createdAt,
      },
      create: {
        appId: parsed.data.appId,
        downloadCount: 1,
        lastDownloadedAt: event.createdAt,
      },
    });

    await recomputeAggregateStatsForApp(parsed.data.appId, event.createdAt);

    return sendSuccess(res, requestId, event, 201);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to track download.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

userRouter.post("/view/track", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = appViewTrackSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid app view tracking payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const app = await prisma.app.findFirst({
      where: {
        id: parsed.data.appId,
        status: AppStatus.PUBLISHED,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!app) {
      return sendFailure(res, requestId, "NOT_FOUND", "App not found.", 404);
    }

    const forwardedFor = req.header("x-forwarded-for") ?? "";
    const ip = forwardedFor.split(",")[0]?.trim();
    const ipHash = ip ? hashIp(ip) : null;

    const event = await prisma.appViewEvent.create({
      data: {
        appId: parsed.data.appId,
        userId: req.header("x-user-id") ?? null,
        sessionId: parsed.data.sessionId,
        source: parsed.data.source,
        ipHash,
        userAgent: req.header("user-agent") ?? null,
      },
      select: {
        id: true,
        appId: true,
        userId: true,
        sessionId: true,
        source: true,
        createdAt: true,
      },
    });

    await prisma.appAggregateStat.upsert({
      where: {
        appId: parsed.data.appId,
      },
      update: {
        viewCount: {
          increment: 1,
        },
        lastViewedAt: event.createdAt,
      },
      create: {
        appId: parsed.data.appId,
        viewCount: 1,
        lastViewedAt: event.createdAt,
      },
    });

    await recomputeAggregateStatsForApp(parsed.data.appId, event.createdAt);

    return sendSuccess(res, requestId, event, 201);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to track app view.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

userRouter.get("/settings", async (req, res) => {
  const requestId = getRequestId(res);
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
      select: {
        themeMode: true,
        customTheme: true,
        emailNotifications: true,
        marketingEmails: true,
        updatedAt: true,
      },
    });

    return sendSuccess(res, requestId, toSettingsPayload(settings));
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch user settings.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

userRouter.patch("/settings", async (req, res) => {
  const requestId = getRequestId(res);
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  try {
    const parsed = userSettingsUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid settings payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const customThemeValue =
      parsed.data.customTheme === null
        ? Prisma.JsonNull
        : parsed.data.customTheme;

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: {
        themeMode: parsed.data.themeMode,
        customTheme:
          parsed.data.customTheme === undefined ? undefined : customThemeValue,
        emailNotifications: parsed.data.emailNotifications,
        marketingEmails: parsed.data.marketingEmails,
      },
      create: {
        userId,
        themeMode: parsed.data.themeMode ?? "system",
        customTheme:
          parsed.data.customTheme === undefined ? undefined : customThemeValue,
        emailNotifications: parsed.data.emailNotifications ?? true,
        marketingEmails: parsed.data.marketingEmails ?? false,
      },
      select: {
        themeMode: true,
        customTheme: true,
        emailNotifications: true,
        marketingEmails: true,
        updatedAt: true,
      },
    });

    return sendSuccess(res, requestId, toSettingsPayload(settings));
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to update user settings.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

userRouter.get("/settings/deletion", async (req, res) => {
  const requestId = getRequestId(res);
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        scheduledDeletionAt: true,
        deletedAt: true,
      },
    });

    if (!user) {
      return sendFailure(res, requestId, "NOT_FOUND", "User not found.", 404);
    }

    return sendSuccess(res, requestId, toDeletionSchedulePayload(user));
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch deletion schedule.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

userRouter.post("/settings/deletion", async (req, res) => {
  const requestId = getRequestId(res);
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  try {
    const parsed = userDeletionScheduleSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid deletion schedule payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        scheduledDeletionAt: true,
        deletedAt: true,
      },
    });

    if (!user) {
      return sendFailure(res, requestId, "NOT_FOUND", "User not found.", 404);
    }

    if (user.deletedAt) {
      return sendFailure(
        res,
        requestId,
        "CONFLICT",
        "Account is already deleted.",
        409,
      );
    }

    if (user.scheduledDeletionAt) {
      return sendFailure(
        res,
        requestId,
        "CONFLICT",
        "Deletion is already scheduled. Cancel it before scheduling again.",
        409,
      );
    }

    const scheduledDeletionAt = new Date(
      Date.now() + parsed.data.delayDays * 24 * 60 * 60 * 1000,
    );

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        scheduledDeletionAt,
      },
      select: {
        scheduledDeletionAt: true,
        deletedAt: true,
      },
    });

    return sendSuccess(res, requestId, toDeletionSchedulePayload(updatedUser));
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to schedule account deletion.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

userRouter.delete("/settings/deletion", async (req, res) => {
  const requestId = getRequestId(res);
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        scheduledDeletionAt: true,
        deletedAt: true,
      },
    });

    if (!user) {
      return sendFailure(res, requestId, "NOT_FOUND", "User not found.", 404);
    }

    if (user.deletedAt) {
      return sendFailure(
        res,
        requestId,
        "CONFLICT",
        "Account is already deleted.",
        409,
      );
    }

    if (!user.scheduledDeletionAt) {
      return sendFailure(
        res,
        requestId,
        "CONFLICT",
        "No scheduled deletion exists for this account.",
        409,
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        scheduledDeletionAt: null,
      },
      select: {
        scheduledDeletionAt: true,
        deletedAt: true,
      },
    });

    return sendSuccess(res, requestId, toDeletionSchedulePayload(updatedUser));
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to cancel account deletion.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

userRouter.get("/library", async (req, res) => {
  const requestId = getRequestId(res);
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  try {
    const libraryItems = await prisma.userLibrary.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        app: {
          select: {
            id: true,
            title: true,
            slug: true,
            shortDescription: true,
            isPaid: true,
            price: true,
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
    });

    return sendSuccess(res, requestId, libraryItems);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch library.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

userRouter.post("/library", async (req, res) => {
  const requestId = getRequestId(res);
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  try {
    const parsed = libraryMutationSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid library payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const item = await prisma.userLibrary.upsert({
      where: {
        userId_appId: {
          userId,
          appId: parsed.data.appId,
        },
      },
      update: {},
      create: {
        userId,
        appId: parsed.data.appId,
      },
    });

    await recomputeAggregateStatsForApp(parsed.data.appId, new Date());

    return sendSuccess(res, requestId, item, 201);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to update library.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

userRouter.delete("/library/:appId", async (req, res) => {
  const requestId = getRequestId(res);
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  try {
    const parsed = appIdParamSchema.safeParse(req.params);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid app id.",
        400,
      );
    }

    await prisma.userLibrary.deleteMany({
      where: {
        userId,
        appId: parsed.data.appId,
      },
    });

    await recomputeAggregateStatsForApp(parsed.data.appId, new Date());

    return sendSuccess(res, requestId, { deleted: true });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to remove library item.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

userRouter.get("/history", async (req, res) => {
  const requestId = getRequestId(res);
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  try {
    const history = await prisma.downloadEvent.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
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

    return sendSuccess(res, requestId, history);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch history.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

userRouter.get("/recently-viewed", async (req, res) => {
  const requestId = getRequestId(res);
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  try {
    const parsed = recentlyViewedQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid recently viewed query.",
        400,
        parsed.error.flatten(),
      );
    }

    const viewEvents = await prisma.appViewEvent.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: parsed.data.limit * 10,
      select: {
        appId: true,
        createdAt: true,
      },
    });

    const eventByAppId = new Map<string, Date>();
    const orderedAppIds: string[] = [];

    for (const event of viewEvents) {
      if (!eventByAppId.has(event.appId)) {
        eventByAppId.set(event.appId, event.createdAt);
        orderedAppIds.push(event.appId);
      }

      if (orderedAppIds.length >= parsed.data.limit) {
        break;
      }
    }

    if (orderedAppIds.length === 0) {
      return sendSuccess(res, requestId, []);
    }

    const apps = await prisma.app.findMany({
      where: {
        id: {
          in: orderedAppIds,
        },
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        isPaid: true,
        isFeatured: true,
        price: true,
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
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    });

    const appMap = new Map(apps.map((app) => [app.id, app]));
    const items = orderedAppIds
      .map((appId) => {
        const app = appMap.get(appId);
        if (!app) {
          return null;
        }

        return {
          ...app,
          viewedAt: eventByAppId.get(appId) ?? null,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return sendSuccess(res, requestId, items);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch recently viewed apps.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

userRouter.get("/feedback", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = feedbackListQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid feedback query.",
        400,
        parsed.error.flatten(),
      );
    }

    const where: Prisma.FeedbackWhereInput = {
      isHidden: false,
    };

    if (parsed.data.appId) {
      where.appId = parsed.data.appId;
    }

    const feedback = await prisma.feedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: parsed.data.limit,
      include: {
        app: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return sendSuccess(res, requestId, feedback);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch feedback list.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

userRouter.post("/feedback", async (req, res) => {
  const requestId = getRequestId(res);
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  try {
    const parsed = feedbackCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid feedback payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId,
        appId: parsed.data.appId,
        message: parsed.data.message,
        rating: parsed.data.rating,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        app: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    await recomputeAggregateStatsForApp(parsed.data.appId, new Date());

    return sendSuccess(res, requestId, feedback, 201);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to submit feedback.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

userRouter.post("/support/tickets", async (req, res) => {
  const requestId = getRequestId(res);
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  try {
    const parsed = supportTicketCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid support ticket payload.",
        400,
        parsed.error.flatten(),
      );
    }

    if (parsed.data.appId) {
      const app = await prisma.app.findFirst({
        where: {
          id: parsed.data.appId,
          deletedAt: null,
          status: AppStatus.PUBLISHED,
        },
        select: {
          id: true,
        },
      });

      if (!app) {
        return sendFailure(res, requestId, "NOT_FOUND", "App not found.", 404);
      }
    }

    const metadataJson = parsed.data.metadata
      ? JSON.stringify(parsed.data.metadata)
      : null;

    const inserted = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
      INSERT INTO support_tickets (
        user_id,
        app_id,
        subject,
        description,
        priority,
        category,
        channel,
        source_url,
        metadata
      )
      VALUES (
        ${userId},
        ${parsed.data.appId ?? null},
        ${parsed.data.subject},
        ${parsed.data.description},
        ${parsed.data.priority}::"SupportTicketPriority",
        ${parsed.data.category ?? null},
        ${parsed.data.channel}::"SupportTicketChannel",
        ${parsed.data.sourceUrl ?? null},
        ${metadataJson}::jsonb
      )
      RETURNING id
    `);

    const ticketId = inserted[0]?.id;
    if (!ticketId) {
      return sendFailure(
        res,
        requestId,
        "INTERNAL_ERROR",
        "Failed to create support ticket.",
        500,
      );
    }

    const ticket = await getSupportTicketById(ticketId, { userId });
    if (!ticket) {
      return sendFailure(
        res,
        requestId,
        "INTERNAL_ERROR",
        "Failed to fetch created support ticket.",
        500,
      );
    }

    return sendSuccess(
      res,
      requestId,
      {
        ticket,
        messages: [],
      },
      201,
    );
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to create support ticket.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

userRouter.get("/support/tickets", async (req, res) => {
  const requestId = getRequestId(res);
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  try {
    const parsed = supportTicketListQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid support ticket query.",
        400,
        parsed.error.flatten(),
      );
    }

    const whereClauses: Prisma.Sql[] = [Prisma.sql`t.user_id = ${userId}`];

    if (parsed.data.status) {
      whereClauses.push(Prisma.sql`t.status::text = ${parsed.data.status}`);
    }

    if (parsed.data.priority) {
      whereClauses.push(Prisma.sql`t.priority::text = ${parsed.data.priority}`);
    }

    if (parsed.data.appId) {
      whereClauses.push(Prisma.sql`t.app_id = ${parsed.data.appId}`);
    }

    if (parsed.data.search) {
      const searchTerm = `%${parsed.data.search}%`;
      whereClauses.push(
        Prisma.sql`(t.subject ILIKE ${searchTerm} OR t.description ILIKE ${searchTerm})`,
      );
    }

    const tickets = await prisma.$queryRaw<
      SupportTicketSummaryRow[]
    >(Prisma.sql`
      SELECT
        t.id,
        t.user_id AS "userId",
        t.app_id AS "appId",
        t.subject,
        t.description,
        t.status::text AS "status",
        t.priority::text AS "priority",
        t.category,
        t.channel::text AS "channel",
        t.source_url AS "sourceUrl",
        t.assigned_to AS "assignedToId",
        t.first_response_at AS "firstResponseAt",
        t.resolved_at AS "resolvedAt",
        t.closed_at AS "closedAt",
        t.created_at AS "createdAt",
        t.updated_at AS "updatedAt",
        a.title AS "appTitle",
        a.slug AS "appSlug",
        (
          SELECT COUNT(*)::int
          FROM support_ticket_messages m
          WHERE m.ticket_id = t.id
            AND m.is_internal = FALSE
        ) AS "messageCount"
      FROM support_tickets t
      LEFT JOIN apps a ON a.id = t.app_id
      WHERE ${Prisma.join(whereClauses, " AND ")}
      ORDER BY t.updated_at DESC
      LIMIT ${parsed.data.limit}
    `);

    return sendSuccess(res, requestId, tickets);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch support tickets.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

userRouter.get("/support/tickets/:id", async (req, res) => {
  const requestId = getRequestId(res);
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  try {
    const parsedParam = supportTicketIdParamSchema.safeParse(req.params);
    if (!parsedParam.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid support ticket id.",
        400,
      );
    }

    const ticket = await getSupportTicketById(parsedParam.data.id, { userId });
    if (!ticket) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Support ticket not found.",
        404,
      );
    }

    const messages = await getSupportTicketMessages(ticket.id, false);

    return sendSuccess(res, requestId, {
      ticket,
      messages,
    });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch support ticket.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

userRouter.post("/support/tickets/:id/replies", async (req, res) => {
  const requestId = getRequestId(res);
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  try {
    const parsedParam = supportTicketIdParamSchema.safeParse(req.params);
    if (!parsedParam.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid support ticket id.",
        400,
      );
    }

    const parsedBody = supportTicketReplyCreateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid support reply payload.",
        400,
        parsedBody.error.flatten(),
      );
    }

    const ticket = await getSupportTicketById(parsedParam.data.id, { userId });
    if (!ticket) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Support ticket not found.",
        404,
      );
    }

    await prisma.$transaction([
      prisma.supportTicketMessage.create({
        data: {
          ticketId: ticket.id,
          authorUserId: userId,
          authorType: "USER",
          body: parsedBody.data.body,
          isInternal: false,
          attachments: parsedBody.data.attachments ? parsedBody.data.attachments : Prisma.JsonNull,
        },
      }),
      prisma.supportTicket.update({
        where: { id: ticket.id },
        data: {
          status: ticket.status === "WAITING_FOR_USER" ? "IN_PROGRESS" : undefined,
          messageCount: { increment: 1 },
          lastMessageAt: new Date(),
        },
      }),
    ]);

    const updatedTicket = await getSupportTicketById(ticket.id, { userId });
    if (!updatedTicket) {
      return sendFailure(
        res,
        requestId,
        "INTERNAL_ERROR",
        "Failed to fetch updated support ticket.",
        500,
      );
    }

    const messages = await getSupportTicketMessages(ticket.id, false);

    return sendSuccess(res, requestId, {
      ticket: updatedTicket,
      messages,
    });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to submit support reply.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminUserRouter.get("/support/tickets", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = adminSupportTicketListQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid admin support ticket query.",
        400,
        parsed.error.flatten(),
      );
    }

    const whereClauses: any = {};

    if (parsed.data.status) {
      whereClauses.status = parsed.data.status;
    } else if (!parsed.data.includeClosed) {
      whereClauses.status = { not: "CLOSED" };
    }

    if (parsed.data.priority) {
      whereClauses.priority = parsed.data.priority;
    }

    if (parsed.data.appId) {
      whereClauses.appId = parsed.data.appId;
    }

    if (parsed.data.assignedToId) {
      whereClauses.assignedToId = parsed.data.assignedToId;
    }

    if (parsed.data.userId) {
      whereClauses.userId = parsed.data.userId;
    }

    if (parsed.data.search) {
      whereClauses.OR = [
        { subject: { contains: parsed.data.search, mode: "insensitive" } },
        { description: { contains: parsed.data.search, mode: "insensitive" } },
      ];
    }

    const ticketsData = await prisma.supportTicket.findMany({
      where: whereClauses,
      orderBy: { updatedAt: "desc" },
      take: parsed.data.limit,
      include: {
        app: {
          select: {
            title: true,
            slug: true,
          }
        }
      }
    });

    const tickets = ticketsData.map((ticket: any) => ({
      ...ticket,
      appTitle: ticket.app?.title ?? null,
      appSlug: ticket.app?.slug ?? null,
    }));

    return sendSuccess(res, requestId, tickets);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch admin support tickets.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminUserRouter.get("/support/tickets/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedParam = supportTicketIdParamSchema.safeParse(req.params);
    if (!parsedParam.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid support ticket id.",
        400,
      );
    }

    const ticket = await getSupportTicketById(parsedParam.data.id);
    if (!ticket) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Support ticket not found.",
        404,
      );
    }

    const messages = await getSupportTicketMessages(ticket.id, true);

    return sendSuccess(res, requestId, {
      ticket,
      messages,
    });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch support ticket.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminUserRouter.patch("/support/tickets/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedParam = supportTicketIdParamSchema.safeParse(req.params);
    if (!parsedParam.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid support ticket id.",
        400,
      );
    }

    const parsedBody = supportTicketUpdateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid support ticket update payload.",
        400,
        parsedBody.error.flatten(),
      );
    }

    if (parsedBody.data.assignedToId) {
      const assignee = await prisma.user.findUnique({
        where: { id: parsedBody.data.assignedToId },
        select: { id: true },
      });

      if (!assignee) {
        return sendFailure(
          res,
          requestId,
          "NOT_FOUND",
          "Assignee user not found.",
          404,
        );
      }
    }

    const updateData: any = {};

    if (parsedBody.data.status !== undefined) {
      updateData.status = parsedBody.data.status;

      // Note: we can't do COALESCE directly in Prisma easily without raw SQL,
      // but we can query the ticket first to check its current values, or just let it overwrite.
      // A better way is to fetch the ticket first to handle logic safely, but for now we'll do the simple update.
      // Wait, we can fetch it first to handle COALESCE accurately.
    }

    const existingTicket = await prisma.supportTicket.findUnique({
      where: { id: parsedParam.data.id }
    });

    if (!existingTicket) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Support ticket not found.",
        404,
      );
    }

    if (parsedBody.data.status !== undefined) {
      updateData.status = parsedBody.data.status;

      if (parsedBody.data.status === "IN_PROGRESS" && !existingTicket.firstResponseAt) {
        updateData.firstResponseAt = new Date();
      }

      if (parsedBody.data.status === "RESOLVED" && !existingTicket.resolvedAt) {
        updateData.resolvedAt = new Date();
      }

      if (parsedBody.data.status === "CLOSED" && !existingTicket.closedAt) {
        updateData.closedAt = new Date();
      }

      if (
        parsedBody.data.status === "OPEN" ||
        parsedBody.data.status === "IN_PROGRESS" ||
        parsedBody.data.status === "WAITING_FOR_USER"
      ) {
        updateData.closedAt = null;
      }
    }

    if (parsedBody.data.priority !== undefined) {
      updateData.priority = parsedBody.data.priority;
    }

    if (parsedBody.data.category !== undefined) {
      updateData.category = parsedBody.data.category;
    }

    if (parsedBody.data.assignedToId !== undefined) {
      updateData.assignedToId = parsedBody.data.assignedToId;
    }

    if (parsedBody.data.sourceUrl !== undefined) {
      updateData.sourceUrl = parsedBody.data.sourceUrl;
    }

    if (parsedBody.data.metadata !== undefined) {
      updateData.metadata = parsedBody.data.metadata;
    }

    updateData.updatedAt = new Date();

    const updated = await prisma.supportTicket.update({
      where: { id: existingTicket.id },
      data: updateData,
    });

    const ticket = await getSupportTicketById(parsedParam.data.id);
    const messages = await getSupportTicketMessages(parsedParam.data.id, true);

    return sendSuccess(res, requestId, {
      ticket,
      messages,
    });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to update support ticket.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminUserRouter.post("/support/tickets/:id/replies", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedParam = supportTicketIdParamSchema.safeParse(req.params);
    if (!parsedParam.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid support ticket id.",
        400,
      );
    }

    const parsedBody = supportTicketReplyCreateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid support reply payload.",
        400,
        parsedBody.error.flatten(),
      );
    }

    const ticket = await getSupportTicketById(parsedParam.data.id);
    if (!ticket) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "Support ticket not found.",
        404,
      );
    }

    const moderatorId = req.header("x-user-id") ?? null;
    const attachmentsJson = parsedBody.data.attachments
      ? JSON.stringify(parsedBody.data.attachments)
      : null;

    await prisma.$transaction([
      prisma.supportTicketMessage.create({
        data: {
          ticketId: ticket.id,
          authorUserId: moderatorId,
          authorType: "AGENT",
          body: parsedBody.data.body,
          isInternal: parsedBody.data.isInternal ?? false,
          attachments: parsedBody.data.attachments ? parsedBody.data.attachments : Prisma.JsonNull,
        },
      }),
      prisma.supportTicket.update({
        where: { id: ticket.id },
        data: parsedBody.data.isInternal
          ? { updatedAt: new Date() }
          : {
              firstResponseAt: ticket.firstResponseAt ?? new Date(),
              status: "WAITING_FOR_USER",
              messageCount: { increment: 1 },
              lastMessageAt: new Date(),
              unreadAdminCount: 0,
            },
      }),
    ]);

    const updatedTicket = await getSupportTicketById(ticket.id);
    const messages = await getSupportTicketMessages(ticket.id, true);

    return sendSuccess(res, requestId, {
      ticket: updatedTicket,
      messages,
    });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to submit support reply.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminUserRouter.get("/feedback", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const includeHidden = req.query.includeHidden === "true";

    const feedback = await prisma.feedback.findMany({
      where: includeHidden ? undefined : { isHidden: false },
      orderBy: { createdAt: "desc" },
      include: {
        app: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return sendSuccess(res, requestId, feedback);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch feedback moderation list.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminUserRouter.get("/stats", async (_req, res) => {
  const requestId = getRequestId(res);

  try {
    const feedbackCount = await prisma.feedback.count();

    return sendSuccess(res, requestId, {
      feedbackCount,
    });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch user stats.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminUserRouter.get("/stats/apps", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = appStatsListQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid app stats query.",
        400,
        parsed.error.flatten(),
      );
    }

    const orderBy: Prisma.AppAggregateStatOrderByWithRelationInput[] =
      parsed.data.sort === "downloads"
        ? [{ downloadCount: "desc" }, { updatedAt: "desc" }]
        : parsed.data.sort === "rating"
          ? [{ averageRating: "desc" }, { feedbackCount: "desc" }]
          : [{ viewCount: "desc" }, { updatedAt: "desc" }];

    const stats = await prisma.appAggregateStat.findMany({
      orderBy,
      take: parsed.data.limit,
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

    return sendSuccess(res, requestId, stats);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch app stats.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminUserRouter.post("/stats/recompute", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = appStatsRecomputeSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid stats recompute payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const targetDate = parsed.data.date ?? new Date();
    let appIds: string[];

    if (parsed.data.appId) {
      const app = await prisma.app.findUnique({
        where: { id: parsed.data.appId },
        select: { id: true },
      });

      if (!app) {
        return sendFailure(res, requestId, "NOT_FOUND", "App not found.", 404);
      }

      appIds = [app.id];
    } else {
      const apps = await prisma.app.findMany({
        where: { deletedAt: null },
        select: { id: true },
      });
      appIds = apps.map((app) => app.id);
    }

    for (const appId of appIds) {
      await recomputeAggregateStatsForApp(appId, targetDate);
    }

    return sendSuccess(res, requestId, {
      recomputed: appIds.length,
      appIds,
      date: targetDate,
    });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to recompute app stats.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminUserRouter.patch("/feedback", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedBody = feedbackModerationSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid moderation payload.",
        400,
        parsedBody.error.flatten(),
      );
    }

    const moderatorId = req.header("x-user-id") ?? null;

    const updated = await prisma.feedback.update({
      where: {
        id: parsedBody.data.feedbackId,
      },
      data: {
        isHidden: parsedBody.data.isHidden,
        moderatedAt: new Date(),
        moderatedById: moderatorId,
      },
    });

    await recomputeAggregateStatsForApp(updated.appId, new Date());

    return sendSuccess(res, requestId, updated);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to moderate feedback.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminUserRouter.patch("/feedback/:id", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsedParam = feedbackIdParamSchema.safeParse(req.params);
    if (!parsedParam.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid feedback id.",
        400,
      );
    }

    const parsedBody = feedbackModerationSchema.safeParse({
      feedbackId: parsedParam.data.id,
      isHidden: req.body?.isHidden,
    });

    if (!parsedBody.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid moderation payload.",
        400,
        parsedBody.error.flatten(),
      );
    }

    const moderatorId = req.header("x-user-id") ?? null;

    const updated = await prisma.feedback.update({
      where: {
        id: parsedBody.data.feedbackId,
      },
      data: {
        isHidden: parsedBody.data.isHidden,
        moderatedAt: new Date(),
        moderatedById: moderatorId,
      },
    });

    await recomputeAggregateStatsForApp(updated.appId, new Date());

    return sendSuccess(res, requestId, updated);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to moderate feedback.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});
