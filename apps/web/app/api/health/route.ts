import { NextResponse } from 'next/server';
import { prisma } from '@elsesourav/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  let dbStatus: 'connected' | 'disconnected' = 'disconnected';

  try {
    // 2-second timeout probe to avoid blocking health checkers
    const probe = prisma.$queryRaw`SELECT 1`;
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DB Timeout')), 2000)
    );
    await Promise.race([probe, timeout]);
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  const isHealthy = dbStatus === 'connected';
  const status = isHealthy ? 'healthy' : 'degraded';

  return NextResponse.json(
    {
      status,
      timestamp: Date.now(),
      version: '2.0.0',
      services: {
        web: 'operational',
        database: dbStatus,
      },
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
