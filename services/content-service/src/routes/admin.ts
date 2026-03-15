import { ContentStatus, prisma } from "@elsesourav/db";
import {
  contentPageCreateSchema,
  contentPageUpdateSchema,
} from "@elsesourav/validation";
import { Router } from "express";
import { z } from "zod";
import { getRequestId, sendFailure, sendSuccess } from "../lib/http";

const pageIdSchema = z.object({
  id: z.string().cuid(),
});

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
