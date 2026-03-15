import { getServerEnv } from "@elsesourav/config";
import { AppStatus, Prisma, prisma } from "@elsesourav/db";
import {
  downloadEventSchema,
  feedbackCreateSchema,
  feedbackModerationSchema,
  libraryMutationSchema,
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

export const userRouter = Router();
export const adminUserRouter = Router();
const env = getServerEnv();

function hashIp(value: string): string {
  return createHash("sha256")
    .update(`${value}:${env.NEXTAUTH_SECRET ?? "fallback-hash-secret"}`)
    .digest("hex");
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
