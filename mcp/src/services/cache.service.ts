import { getRedisClient } from "../infrastructure/cache/redis.js";
import { config } from "../core/config.js";
import { logger } from "../core/logger.js";

/**
 * Generic cache service backed by Redis.
 * Keys are scoped by project ID to ensure tenant isolation.
 */

/**
 * Build a namespaced cache key.
 */
function buildKey(namespace: string, ...parts: string[]): string {
  return `mcp:${namespace}:${parts.join(":")}`;
}

/**
 * Get a cached value, deserialized from JSON.
 */
export async function cacheGet<T>(
  namespace: string,
  ...keyParts: string[]
): Promise<T | null> {
  try {
    const redis = getRedisClient();
    const key = buildKey(namespace, ...keyParts);
    const raw = await redis.get(key);

    if (raw === null) return null;

    return JSON.parse(raw) as T;
  } catch (error) {
    logger.warn("Cache GET failed, falling through", error);
    return null;
  }
}

/**
 * Set a cached value with TTL (defaults to config.cacheTtlSeconds).
 */
export async function cacheSet(
  namespace: string,
  keyParts: string[],
  value: unknown,
  ttlSeconds?: number
): Promise<void> {
  try {
    const redis = getRedisClient();
    const key = buildKey(namespace, ...keyParts);
    const ttl = ttlSeconds ?? config.cacheTtlSeconds;

    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch (error) {
    logger.warn("Cache SET failed, continuing without cache", error);
  }
}

/**
 * Invalidate cache entries matching a pattern.
 * Use after writes to ensure stale data is cleared.
 */
export async function cacheInvalidate(
  namespace: string,
  ...keyParts: string[]
): Promise<void> {
  try {
    const redis = getRedisClient();
    const pattern = buildKey(namespace, ...keyParts, "*");
    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      await redis.del(...keys);
      logger.debug(`Cache invalidated ${keys.length} keys matching: ${pattern}`);
    }
  } catch (error) {
    logger.warn("Cache INVALIDATE failed", error);
  }
}
