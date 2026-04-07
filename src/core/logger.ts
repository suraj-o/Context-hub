import { config } from "./config.js";

/**
 * Structured logger that writes to stderr.
 * MCP requires stdout exclusively for JSON-RPC — all logs must use stderr.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private level: number;

  constructor(level: LogLevel) {
    this.level = LOG_LEVELS[level];
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= this.level;
  }

  private format(level: LogLevel, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    if (meta !== undefined) {
      return `${base} ${JSON.stringify(meta)}`;
    }
    return base;
  }

  debug(message: string, meta?: unknown): void {
    if (this.shouldLog("debug")) {
      console.error(this.format("debug", message, meta));
    }
  }

  info(message: string, meta?: unknown): void {
    if (this.shouldLog("info")) {
      console.error(this.format("info", message, meta));
    }
  }

  warn(message: string, meta?: unknown): void {
    if (this.shouldLog("warn")) {
      console.error(this.format("warn", message, meta));
    }
  }

  error(message: string, meta?: unknown): void {
    if (this.shouldLog("error")) {
      console.error(this.format("error", message, meta));
    }
  }
}

export const logger = new Logger(config.logLevel);
