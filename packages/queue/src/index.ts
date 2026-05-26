import { Queue, Worker, QueueEvents } from "bullmq";
import { getServerEnv } from "@elsesourav/config";
import IORedis from "ioredis";

export function getQueueConnection() {
  const env = getServerEnv();
  if (!env.UPSTASH_REDIS_REST_URL) {
    throw new Error("Redis URL is required for BullMQ");
  }
  
  // Note: Upstash REST Redis URL does not work with BullMQ directly because BullMQ requires raw Redis TCP/TLS connections.
  // We need REDIS_URL for BullMQ.
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn("[Queue] REDIS_URL not set. Queue operations will fail.");
    return new IORedis({ maxRetriesPerRequest: null, lazyConnect: true });
  }

  return new IORedis(redisUrl, { maxRetriesPerRequest: null });
}

export function createQueue(name: string) {
  const connection = getQueueConnection();
  return new Queue(name, { connection });
}

export function createWorker(name: string, processor: any) {
  const connection = getQueueConnection();
  return new Worker(name, processor, { connection });
}
