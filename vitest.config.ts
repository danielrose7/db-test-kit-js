import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  test: {
    include: ["test/**/*.test.ts"],
    globalSetup: ["./test/db/global-setup.ts"],
    setupFiles: ["./test/db/setup.ts"],
    // Real-Postgres runs share one database; PGlite has one per file, so files
    // could run in parallel there. Sequential is the simple, safe default.
    fileParallelism: false,
  },
});
