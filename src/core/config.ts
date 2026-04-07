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

  // Embedding
  embeddingProvider: "openai" | "local";
  openaiApiKey: string;
  openaiEmbeddingModel: string;
  localEmbeddingUrl: string;

  // Server
  logLevel: "debug" | "info" | "warn" | "error";
  nodeEnv: string;

  // Processing
  maxChunkSize: number;
  minContentLength: number;

  // Sync
  syncWatchExtensions: string[];
  syncIgnorePatterns: string[];
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
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

    embeddingProvider: (optionalEnv("EMBEDDING_PROVIDER", "openai") as "openai" | "local"),
    openaiApiKey: optionalEnv("OPENAI_API_KEY", ""),
    openaiEmbeddingModel: optionalEnv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"),
    localEmbeddingUrl: optionalEnv("LOCAL_EMBEDDING_URL", ""),

    logLevel: optionalEnv("LOG_LEVEL", "info") as AppConfig["logLevel"],
    nodeEnv: optionalEnv("NODE_ENV", "development"),

    maxChunkSize: optionalInt("MAX_CHUNK_SIZE", 2000),
    minContentLength: optionalInt("MIN_CONTENT_LENGTH", 10),

    syncWatchExtensions: optionalEnv("SYNC_WATCH_EXTENSIONS", ".ts,.js,.py,.go,.rs")
      .split(",")
      .map((ext) => ext.trim()),
    syncIgnorePatterns: optionalEnv("SYNC_IGNORE_PATTERNS", "node_modules,dist,.git,build")
      .split(",")
      .map((p) => p.trim()),
  };
}

/** Singleton config instance */
export const config = loadConfig();
