import { getRedisClient } from "@elsesourav/cache";

export const cacheExtension = {
  model: {
    $allModels: {
      /**
       * Fetches a unique record and caches it in Redis.
       * 
       * @param args Prisma findUnique arguments
       * @param ttl Cache Time-to-Live in seconds (default: 300)
       */
      async findUniqueCached<T, A>(
        this: T,
        args: A & { ttl?: number },
      ): Promise<any> {
        const context = this as any;
        const modelName = context.name || "UnknownModel";
        
        // Destructure ttl from args if provided
        const { ttl = 300, ...queryArgs } = args as any;

        // Generate a deterministic cache key based on the query arguments
        const cacheKey = `prisma:${modelName}:findUnique:${JSON.stringify(queryArgs)}`;

        const redis = getRedisClient();
        if (!redis) {
          // If Redis is unavailable, fallback to direct DB call
          return context.findUnique(queryArgs);
        }

        try {
          const cachedData = await redis.get(cacheKey);
          if (cachedData) {
            return typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;
          }
        } catch (error) {
          console.warn(`[Redis Cache Error] Failed to read ${cacheKey}`, error);
        }

        const data = await context.findUnique(queryArgs);

        if (data) {
          try {
            await redis.set(cacheKey, JSON.stringify(data), { ex: ttl });
          } catch (error) {
            console.warn(`[Redis Cache Error] Failed to write ${cacheKey}`, error);
          }
        }

        return data;
      },

      /**
       * Fetches multiple records and caches the result.
       */
      async findManyCached<T, A>(
        this: T,
        args: A & { ttl?: number },
      ): Promise<any[]> {
        const context = this as any;
        const modelName = context.name || "UnknownModel";
        
        const { ttl = 300, ...queryArgs } = args as any;
        const cacheKey = `prisma:${modelName}:findMany:${JSON.stringify(queryArgs)}`;

        const redis = getRedisClient();
        if (!redis) {
          return context.findMany(queryArgs);
        }

        try {
          const cachedData = await redis.get(cacheKey);
          if (cachedData) {
            return (typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData) as any[];
          }
        } catch (error) {
          console.warn(`[Redis Cache Error] Failed to read ${cacheKey}`, error);
        }

        const data = await context.findMany(queryArgs);

        if (data) {
          try {
            await redis.set(cacheKey, JSON.stringify(data), { ex: ttl });
          } catch (error) {
            console.warn(`[Redis Cache Error] Failed to write ${cacheKey}`, error);
          }
        }

        return data;
      }
    }
  }
};
