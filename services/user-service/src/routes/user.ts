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
