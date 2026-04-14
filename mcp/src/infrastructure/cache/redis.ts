import { Redis } from "ioredis";
import { config } from "../../core/config.js";
import { logger } from "../../core/logger.js";

/**
 * Singleton Redis client for caching.
 */

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      retryStrategy(times: number) {
        if (times > 5) {
          logger.error("Redis: max retries reached, giving up");
          return null;
        }
        return Math.min(times * 200, 2000);
      },
    });

    redisClient.on("connect", () => {
      logger.info("Redis connected");
    });

    redisClient.on("error", (err: Error) => {
      logger.error("Redis connection error", err);
    });
  }

  return redisClient;
}

/**
 * Connect Redis (call during bootstrap).
 */
export async function connectRedis(): Promise<void> {
  const client = getRedisClient();
  await client.connect();
}

/**
 * Disconnect Redis (call during shutdown).
 */
export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info("Redis disconnected");
  }
}
