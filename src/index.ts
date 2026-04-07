import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./gateway/server.js";
import { connectRedis, disconnectRedis } from "./infrastructure/cache/redis.js";
import { prisma } from "./repository/prisma.js";
import { logger } from "./core/logger.js";

/**
 * MCP Brain Server — Bootstrapper
 *
 * 1. Connects Redis cache.
 * 2. Starts MCP server on stdio transport.
 * 3. Registers graceful shutdown handlers for SIGINT/SIGTERM.
 *
 * All logging uses stderr to keep stdout clean for JSON-RPC.
 */
async function main(): Promise<void> {
  // ── Connect infrastructure ──
  try {
    await connectRedis();
  } catch (error) {
    logger.warn("Redis connection failed — running without cache", error);
    // Non-fatal: server works without Redis, just no caching
  }

  // ── Start MCP server ──
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("🧠 MCP Brain Server v2.0 running on stdio");

  // ── Graceful shutdown ──
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down...`);
    try {
      await disconnectRedis();
      await prisma.$disconnect();
    } catch (err) {
      logger.error("Error during shutdown", err);
    }
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((error) => {
  logger.error("Fatal error in main()", error);
  process.exit(1);
});

// Global uncaught handlers
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection", reason);
  process.exit(1);
});
