import { searchContext } from "./src/services/query.service.js";

async function test() {
  const results = await searchContext({
    projectId: "92106197-043b-4bcf-87fd-91937d50d2af", // User's standard project UUID
    query: "invoice template rotation",
    limit: 2
  });

  console.log("Search Results:", results.map(r => r.title));
  process.exit(0);
}
test().catch(e => { console.error(e); process.exit(1); });
