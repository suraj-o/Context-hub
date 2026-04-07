import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./gateway/server.js";

/**
 * MCP Brain Server — Bootstrapper
 *
 * Connects the MCP server to a stdio transport for communication
 * with AI IDE clients. All logging uses stderr to avoid corrupting
 * the JSON-RPC channel on stdout.
 */
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🧠 MCP Brain Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
