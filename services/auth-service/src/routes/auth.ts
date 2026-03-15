import { getServerEnv } from "@elsesourav/config";
import { Role, prisma } from "@elsesourav/db";
import { credentialsSchema, registerSchema } from "@elsesourav/validation";
import bcrypt from "bcryptjs";
import { type Request, Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { getRequestId, sendFailure, sendSuccess } from "../lib/http";

const env = getServerEnv();
const jwtSecret =
  env.AUTH_JWT_SECRET ??
  env.NEXTAUTH_SECRET ??
  "dev-auth-service-jwt-secret-change-me";

export const authRouter = Router();

const roleUpdateSchema = z.object({
  userId: z.string().cuid(),
  role: z.nativeEnum(Role),
});

const oauthGithubUpsertSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(1).max(120).optional().nullable(),
  image: z.string().url().optional().nullable(),
});

function hasInternalToken(req: Request): boolean {
  return (
    !!env.INTERNAL_SERVICE_TOKEN &&
    req.header("x-internal-token") === env.INTERNAL_SERVICE_TOKEN
  );
}

function hasInternalAdminAccess(req: Request): boolean {
  return (
    !!env.INTERNAL_SERVICE_TOKEN &&
    req.header("x-internal-token") === env.INTERNAL_SERVICE_TOKEN &&
    req.header("x-user-role") === Role.ADMIN
  );
}

authRouter.post("/register", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid registration payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    });

    if (existingUser) {
      return sendFailure(
        res,
        requestId,
        "CONFLICT",
        "Email already exists.",
        409,
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        passwordHash,
        role: Role.USER,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return sendSuccess(res, requestId, user, 201);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to register user.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

authRouter.post("/oauth/github/upsert", async (req, res) => {
  const requestId = getRequestId(res);

  if (!hasInternalToken(req)) {
    return sendFailure(
      res,
      requestId,
      "FORBIDDEN",
      "Invalid internal token.",
      403,
    );
  }

  try {
    const parsed = oauthGithubUpsertSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid OAuth payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const user = await prisma.user.upsert({
      where: { email: parsed.data.email },
      update: {
        name: parsed.data.name ?? undefined,
        image: parsed.data.image ?? undefined,
      },
      create: {
        email: parsed.data.email,
        name: parsed.data.name ?? undefined,
        image: parsed.data.image ?? undefined,
        role: Role.USER,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
      },
    });

    return sendSuccess(res, requestId, user);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to sync OAuth user.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

authRouter.post("/login", async (req, res) => {
  const requestId = getRequestId(res);

  try {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid login payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
      },
    });

    if (!user?.passwordHash) {
      return sendFailure(
        res,
        requestId,
        "UNAUTHORIZED",
        "Invalid credentials.",
        401,
      );
    }

    const validPassword = await bcrypt.compare(
      parsed.data.password,
      user.passwordHash,
    );

    if (!validPassword) {
      return sendFailure(
        res,
        requestId,
        "UNAUTHORIZED",
        "Invalid credentials.",
        401,
      );
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      {
        expiresIn: "7d",
      },
    );

    return sendSuccess(res, requestId, {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to login user.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

authRouter.get("/session/verify", async (req, res) => {
  const requestId = getRequestId(res);
  const authHeader = req.header("authorization") ?? "";

  if (!authHeader.startsWith("Bearer ")) {
    return sendFailure(
      res,
      requestId,
      "UNAUTHORIZED",
      "Missing bearer token.",
      401,
    );
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, jwtSecret) as {
      sub?: string;
      email?: string;
      role?: Role;
    };

    if (!payload.sub || !payload.email || !payload.role) {
      return sendFailure(
        res,
        requestId,
        "UNAUTHORIZED",
        "Invalid token payload.",
        401,
      );
    }

    return sendSuccess(res, requestId, {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    });
  } catch {
    return sendFailure(
      res,
      requestId,
      "UNAUTHORIZED",
      "Invalid or expired token.",
      401,
    );
  }
});

authRouter.get("/users/:id", async (req, res) => {
  const requestId = getRequestId(res);
  const internalToken = req.header("x-internal-token");

  if (
    !env.INTERNAL_SERVICE_TOKEN ||
    internalToken !== env.INTERNAL_SERVICE_TOKEN
  ) {
    return sendFailure(
      res,
      requestId,
      "FORBIDDEN",
      "Invalid internal token.",
      403,
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return sendFailure(res, requestId, "NOT_FOUND", "User not found.", 404);
    }

    return sendSuccess(res, requestId, user);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch user.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

authRouter.get("/admin/users", async (req, res) => {
  const requestId = getRequestId(res);

  if (!hasInternalAdminAccess(req)) {
    return sendFailure(
      res,
      requestId,
      "FORBIDDEN",
      "Admin internal access is required.",
      403,
    );
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            libraries: true,
            feedbacks: true,
            payments: true,
          },
        },
      },
    });

    return sendSuccess(res, requestId, users);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch users.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

authRouter.get("/admin/stats", async (req, res) => {
  const requestId = getRequestId(res);

  if (!hasInternalAdminAccess(req)) {
    return sendFailure(
      res,
      requestId,
      "FORBIDDEN",
      "Admin internal access is required.",
      403,
    );
  }

  try {
    const usersCount = await prisma.user.count();

    return sendSuccess(res, requestId, {
      usersCount,
    });
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to fetch auth stats.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

authRouter.patch("/admin/users", async (req, res) => {
  const requestId = getRequestId(res);

  if (!hasInternalAdminAccess(req)) {
    return sendFailure(
      res,
      requestId,
      "FORBIDDEN",
      "Admin internal access is required.",
      403,
    );
  }

  try {
    const parsed = roleUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendFailure(
        res,
        requestId,
        "VALIDATION_ERROR",
        "Invalid role update payload.",
        400,
        parsed.error.flatten(),
      );
    }

    const actingUserId = req.header("x-user-id") ?? "";
    if (
      parsed.data.userId === actingUserId &&
      parsed.data.role !== Role.ADMIN
    ) {
      return sendFailure(
        res,
        requestId,
        "CONFLICT",
        "You cannot remove your own admin access.",
        409,
      );
    }

    const updated = await prisma.user.update({
      where: { id: parsed.data.userId },
      data: { role: parsed.data.role },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return sendSuccess(res, requestId, updated);
  } catch (error) {
    return sendFailure(
      res,
      requestId,
      "INTERNAL_ERROR",
      "Failed to update user role.",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});
