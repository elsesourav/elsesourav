import { requireAdminSession } from "@/lib/auth-guard";
import { getRedisClient } from "@elsesourav/cache";
import { getServerEnv } from "@elsesourav/config";
import { prisma } from "@elsesourav/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function checkServiceHealth(name: string, url: string) {
  const start = Date.now();
  try {
    const res = await fetch(`${url}/health`, { 
      signal: AbortSignal.timeout(3000),
      headers: {
        "x-internal-token": getServerEnv().INTERNAL_SERVICE_TOKEN || ""
      }
    });
    const time = Date.now() - start;
    
    if (res.ok) {
      return { name, status: "healthy", timeMs: time, url };
    }
    return { name, status: "failed", timeMs: time, url };
  } catch (e) {
    return { name, status: "down", timeMs: Date.now() - start, url };
  }
}

export async function GET(request: Request) {
  const { response } = await requireAdminSession(request);
  if (response) {
    return response;
  }

  const env = getServerEnv();

  const services = [
    { name: "Auth Service", url: env.AUTH_SERVICE_URL || "http://localhost:4001" },
    { name: "Catalog Service", url: env.CATALOG_SERVICE_URL || "http://localhost:4002" },
    { name: "User Service", url: env.USER_SERVICE_URL || "http://localhost:4003" },
    { name: "Content Service", url: env.CONTENT_SERVICE_URL || "http://localhost:4004" },
    { name: "Theme Service", url: env.THEME_SERVICE_URL || "http://localhost:4005" },
  ];

  const serviceResults = await Promise.all(
    services.map(s => checkServiceHealth(s.name, s.url))
  );

  // Check DB Connection
  let dbStatus = "healthy";
  let dbTime = 0;
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbTime = Date.now() - start;
  } catch (e) {
    dbStatus = "failed";
  }

  // Check Cache Connection
  let cacheStatus = "healthy";
  let cacheTime = 0;
  try {
    const start = Date.now();
    const redis = getRedisClient();
    if (redis) {
      await redis.ping();
      cacheTime = Date.now() - start;
    } else {
      cacheStatus = "failed";
    }
  } catch (e) {
    cacheStatus = "failed";
  }

  return NextResponse.json({
    services: serviceResults,
    infrastructure: {
      database: { status: dbStatus, timeMs: dbTime },
      cache: { status: cacheStatus, timeMs: cacheTime }
    }
  });
}
