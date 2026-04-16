/**
 * Type-safe configuration loader.
 * Reads environment variables with sensible defaults.
 */

export interface AppConfig {
  // Database
  databaseUrl: string;

  // Redis
  redisUrl: string;
  cacheTtlSeconds: number;

  // Server
  logLevel: "debug" | "info" | "warn" | "error";
  nodeEnv: string;

  // Processing
  maxChunkSize: number;
  minContentLength: number;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

function optionalInt(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) ? fallback : parsed;
}

export function loadConfig(): AppConfig {
  return {
    databaseUrl: optionalEnv("DATABASE_URL", ""),

    redisUrl: optionalEnv("REDIS_URL", "redis://localhost:6379"),
    cacheTtlSeconds: optionalInt("CACHE_TTL_SECONDS", 300),

    logLevel: optionalEnv("LOG_LEVEL", "info") as AppConfig["logLevel"],
    nodeEnv: optionalEnv("NODE_ENV", "development"),

    maxChunkSize: optionalInt("MAX_CHUNK_SIZE", 2000),
    minContentLength: optionalInt("MIN_CONTENT_LENGTH", 10),
  };
}

/** Singleton config instance */
export const config = loadConfig();
