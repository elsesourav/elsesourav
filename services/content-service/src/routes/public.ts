import { ContentStatus, prisma } from "@elsesourav/db";
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

export const publicContentRouter = Router();

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
