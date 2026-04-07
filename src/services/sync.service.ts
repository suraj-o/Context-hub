import { watch } from "chokidar";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { saveContext } from "./write.service.js";

// ── Types ──────────────────────────────────────────────────

export interface SyncServiceOptions {
  /** Absolute path to the project directory to watch */
  projectPath: string;
  /** Project identifier for tagging stored contexts */
  projectId: string;
}

// ── Service ────────────────────────────────────────────────

/**
 * Background file watcher that automatically indexes code files.
 *
 * Watches the given project path for changes to `.ts`, `.js`, and `.py` files.
 * On each change (add or modify), the file content is read and sent to
 * the WriteService for embedding and storage — bypassing the MCP gateway.
 *
 * @param options - Project path and ID configuration
 * @returns Cleanup function to stop the watcher
 */
export function startSyncService(options: SyncServiceOptions): () => void {
  const { projectPath, projectId } = options;

  const watcher = watch(projectPath, {
    ignored: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.git/**",
      "**/build/**",
    ],
    persistent: true,
    ignoreInitial: true,
  });

  const handleFile = async (filePath: string): Promise<void> => {
    // Only process supported file types
    if (!/\.(ts|js|py)$/.test(filePath)) return;

    try {
      const content = await readFile(filePath, "utf-8");

      // Skip empty or very small files
      if (content.trim().length < 10) return;

      await saveContext({
        projectId,
        type: "code_snippet",
        content,
        metadata: {
          filePath,
          fileName: basename(filePath),
          indexedAt: new Date().toISOString(),
          source: "sync_service",
        },
      });

      console.error(`[SyncService] Indexed: ${filePath}`);
    } catch (error) {
      console.error(`[SyncService] Error indexing ${filePath}:`, error);
    }
  };

  watcher.on("add", handleFile);
  watcher.on("change", handleFile);

  console.error(
    `[SyncService] Watching for file changes in: ${projectPath}`
  );

  // Return cleanup function
  return () => {
    watcher.close();
    console.error("[SyncService] Stopped watching.");
  };
}
