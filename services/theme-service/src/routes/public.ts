import { prisma } from "@elsesourav/db";
import { Router } from "express";
import { getRequestId, sendFailure, sendSuccess } from "../lib/http";

export const publicThemeRouter = Router();

publicThemeRouter.get("/active", async (_req, res) => {
  const requestId = getRequestId(res);

  try {
    const activeTheme = await prisma.themeConfig.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    });

    if (!activeTheme) {
      return sendFailure(
        res,
        requestId,
        "NOT_FOUND",
        "No active theme configured.",
        404,
      );
    }

    return sendSuccess(res, requestId, activeTheme);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch active theme.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

publicThemeRouter.get("/active-images", async (_req, res) => {
  const requestId = getRequestId(res);

  try {
    const activeImages = await prisma.imageConfig.findMany({
      where: { isActive: true },
    });

    const activeImagesMap = activeImages.reduce((acc: Record<string, any>, img: any) => {
      acc[img.section] = img;
      return acc;
    }, {} as Record<string, any>);

    return sendSuccess(res, requestId, activeImagesMap);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch active image config.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});
