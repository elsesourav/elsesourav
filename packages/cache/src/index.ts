import { getServerEnv } from "@elsesourav/config";
import { Redis } from "@upstash/redis";

let redisClient: Redis | null | undefined;

export function getRedisClient(): Redis | null {
  if (redisClient !== undefined) {
    return redisClient;
  }

  const env = getServerEnv();
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    redisClient = null;
    return redisClient;
  }

  redisClient = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });

  return redisClient;
}

export async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) {
    return null;
  }

  return client.get<T>(key);
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds = 300,
): Promise<void> {
  const client = getRedisClient();
  if (!client) {
    return;
  }

  await client.set(key, value, { ex: ttlSeconds });
}

export async function deleteCache(key: string): Promise<void> {
  const client = getRedisClient();
  if (!client) {
    return;
  }

  await client.del(key);
}

export async function deleteCacheByPattern(pattern: string): Promise<void> {
  const client = getRedisClient();
  if (!client) {
    return;
  }

  const keys = await client.keys(pattern);
  if (keys.length === 0) {
    return;
  }

  await client.del(...keys);
}
