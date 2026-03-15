import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const DEV_DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5432/elsesourav";

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    return databaseUrl;
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `[db] DATABASE_URL is not set. Falling back to local development database (${DEV_DATABASE_URL}).`,
    );
    return DEV_DATABASE_URL;
  }

  throw new Error("DATABASE_URL is required to initialize Prisma client.");
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const adapter = new PrismaPg({ connectionString: getDatabaseUrl() });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
