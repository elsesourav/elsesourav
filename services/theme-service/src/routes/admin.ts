import { prisma } from "@elsesourav/db";
import {
  themeConfigCreateSchema,
  themeConfigUpdateSchema,
} from "@elsesourav/validation";
import { Router } from "express";
import { z } from "zod";
import { getRequestId, sendFailure, sendSuccess } from "../lib/http";

const idParamSchema = z.object({
  id: z.string().cuid(),
});

export const adminThemeRouter = Router();

adminThemeRouter.get("/configs", async (_req, res) => {
  const requestId = getRequestId(res);

  try {
    const configs = await prisma.themeConfig.findMany({
      orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    });

    return sendSuccess(res, requestId, configs);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch theme configs.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminThemeRouter.post("/configs", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = themeConfigCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid theme payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const userId = req.header("x-user-id") ?? null;

    const config = await prisma.themeConfig.create({
      data: {
        name: parsed.data.name,
        primaryColor: parsed.data.primaryColor,
        secondaryColor: parsed.data.secondaryColor,
        accentColor: parsed.data.accentColor,
        actionColor: parsed.data.actionColor,
        backgroundColor: parsed.data.backgroundColor,
        foregroundColor: parsed.data.foregroundColor,
        darkPrimaryColor: parsed.data.darkPrimaryColor,
        darkSecondaryColor: parsed.data.darkSecondaryColor,
        darkAccentColor: parsed.data.darkAccentColor,
        darkActionColor: parsed.data.darkActionColor,
        darkBackgroundColor: parsed.data.darkBackgroundColor,
        darkForegroundColor: parsed.data.darkForegroundColor,
        fontSans: parsed.data.fontSans,
        fontHeading: parsed.data.fontHeading,
        headingScale: parsed.data.headingScale,
        isActive: parsed.data.isActive,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    if (parsed.data.isActive) {
      await prisma.themeConfig.updateMany({
        where: { id: { not: config.id } },
        data: { isActive: false },
      });
    }

    return sendSuccess(res, requestId, config, 201);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to create theme config.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminThemeRouter.patch("/configs/:id", async (req, res) => {
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

    const parsedBody = themeConfigUpdateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid theme update payload.",
        400,
        parsedBody.error.flatten(),
      );
    }

    const userId = req.header("x-user-id") ?? null;

    const config = await prisma.themeConfig.update({
      where: { id: parsedId.data.id },
      data: {
        name: parsedBody.data.name,
        primaryColor: parsedBody.data.primaryColor,
        secondaryColor: parsedBody.data.secondaryColor,
        accentColor: parsedBody.data.accentColor,
        actionColor: parsedBody.data.actionColor,
        backgroundColor: parsedBody.data.backgroundColor,
        foregroundColor: parsedBody.data.foregroundColor,
        darkPrimaryColor: parsedBody.data.darkPrimaryColor,
        darkSecondaryColor: parsedBody.data.darkSecondaryColor,
        darkAccentColor: parsedBody.data.darkAccentColor,
        darkActionColor: parsedBody.data.darkActionColor,
        darkBackgroundColor: parsedBody.data.darkBackgroundColor,
        darkForegroundColor: parsedBody.data.darkForegroundColor,
        fontSans: parsedBody.data.fontSans,
        fontHeading: parsedBody.data.fontHeading,
        headingScale: parsedBody.data.headingScale,
        isActive: parsedBody.data.isActive,
        updatedBy: userId,
      },
    });

    if (parsedBody.data.isActive === true) {
      await prisma.themeConfig.updateMany({
        where: { id: { not: config.id } },
        data: { isActive: false },
      });
    }

    return sendSuccess(res, requestId, config);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to update theme config.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

adminThemeRouter.post("/configs/:id/activate", async (req, res) => {
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

    await prisma.$transaction([
      prisma.themeConfig.updateMany({
        data: {
          isActive: false,
        },
      }),
      prisma.themeConfig.update({
        where: { id: parsedId.data.id },
        data: {
          isActive: true,
          updatedBy: userId,
        },
      }),
    ]);

    const activeTheme = await prisma.themeConfig.findUnique({
      where: { id: parsedId.data.id },
    });

    return sendSuccess(res, requestId, activeTheme);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to activate theme config.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});
