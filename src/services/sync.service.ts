import { watch } from "chokidar";
import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";
import { saveContext } from "./write.service.js";
import { config } from "../core/config.js";
import { logger } from "../core/logger.js";

// ── Types ──────────────────────────────────────────────────

export interface SyncServiceOptions {
  /** Absolute path to the project directory to watch */
  projectPath: string;
  /** Project UUID for tagging stored contexts */
  projectId: string;
}

// ── Language Detection ─────────────────────────────────────

const EXT_TO_LANGUAGE: Record<string, string> = {
  ".ts": "typescript",
  ".tsx": "typescript",
  ".js": "javascript",
  ".jsx": "javascript",
  ".py": "python",
  ".go": "go",
  ".rs": "rust",
};

// ── Service ────────────────────────────────────────────────

/**
 * Background file watcher that automatically indexes code files.
 *
 * Watches the given project path for changes to configured file extensions.
 * On each change (add or modify), the file content is read and sent through
 * the full WriteService pipeline (clean → filter → chunk → embed → store).
 *
 * @param options - Project path and ID configuration
 * @returns Cleanup function to stop the watcher
 */
export function startSyncService(options: SyncServiceOptions): () => void {
  const { projectPath, projectId } = options;

  // Build ignore patterns from config
  const ignorePatterns = config.syncIgnorePatterns.map((p) => `**/${p}/**`);

  // Build extension regex from config
  const extRegex = new RegExp(
    `(${config.syncWatchExtensions.map((e) => e.replace(".", "\\.")).join("|")})$`
  );

  const watcher = watch(projectPath, {
    ignored: ignorePatterns,
    persistent: true,
    ignoreInitial: true,
  });

  const handleFile = async (filePath: string): Promise<void> => {
    if (!extRegex.test(filePath)) return;

    try {
      const content = await readFile(filePath, "utf-8");

      // Skip empty or trivially small files
      if (content.trim().length < config.minContentLength) return;

      const ext = extname(filePath);
      const language = EXT_TO_LANGUAGE[ext] ?? ext.slice(1);

      await saveContext({
        projectId,
        contextType: "code_snippet",
        title: `[Auto] ${basename(filePath)}`,
        rawContent: content,
        sourceInfo: {
          filePath,
          language,
        },
        metadata: {
          source: "sync_service",
          indexedAt: new Date().toISOString(),
        },
      });

      logger.debug(`[SyncService] Indexed: ${filePath}`);
    } catch (error) {
      logger.error(`[SyncService] Error indexing ${filePath}`, error);
    }
  };

  watcher.on("add", handleFile);
  watcher.on("change", handleFile);

  logger.info(`[SyncService] Watching: ${projectPath}`);

  return () => {
    watcher.close();
    logger.info("[SyncService] Stopped watching");
  };
}
