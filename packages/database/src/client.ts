import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import path from 'node:path';
import dotenv from 'dotenv';

let _pool: pg.Pool | null = null;
let _client: PrismaClient | null = null;

function getOrCreatePrismaClient(): PrismaClient {
  if (_client) return _client;

  if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
    dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  }

  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL || '';
  _pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(_pool);

  _client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  return _client;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = getOrCreatePrismaClient();
    }
    const client = globalForPrisma.prisma;
    const value = (client as unknown as Record<string, unknown>)[prop as string];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
