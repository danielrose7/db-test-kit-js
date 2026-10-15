import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

// skill/db-test-kit/SKILL.md = Agent Skills frontmatter + RECREATE.md, so the
// two can never disagree. Edit RECREATE.md, then `pnpm skill:sync`.
// (test/skill-sync.test.ts fails if you forget.)

const root = path.resolve(import.meta.dirname, "..");

export const FRONTMATTER = `---
name: db-test-kit
description: Add database-backed integration testing to a TypeScript/Drizzle project: per-test transaction rollback, Rails-style label-keyed fixtures with typed foreign-key references, fishery factories, and a signInAs session seam. Use when asked to set up, port, or fix DB-backed tests, fixtures, factories, or transaction-isolated tests.
---

> The reference implementation is the \`db-test-kit-js\` repository (ask the user for its path or URL if it
> isn't in context). Read its files as you follow the steps below; copy, don't depend.

`;

export function generate() {
  return FRONTMATTER + readFileSync(path.join(root, "RECREATE.md"), "utf8");
}

if (process.argv[1] === import.meta.filename) {
  writeFileSync(path.join(root, "skill/db-test-kit/SKILL.md"), generate());
  console.log("wrote skill/db-test-kit/SKILL.md");
}
