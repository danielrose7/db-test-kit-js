import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const pages = [
  ["Home", "docs/index.md"],
  ["Quick start", "docs/guide/quick-start.md"],
  ["How it works", "docs/guide/how-it-works.md"],
  ["Choose an adoption path", "docs/guide/choose-a-path.md"],
  ["Adopt the Drizzle version", "docs/guide/drizzle.md"],
  ["Adopt the Prisma version", "docs/guide/prisma.md"],
  ["Update an existing copy", "docs/guide/updating.md"],
  ["Examples", "docs/examples/index.md"],
  ["Example: a rollback test", "docs/examples/rollback-test.md"],
  ["Example: fixtures and factories", "docs/examples/fixtures-factories.md"],
  ["Example: authorization and tenancy", "docs/examples/authorization.md"],
  ["Example: real concurrency", "docs/examples/concurrency.md"],
  ["Fixtures", "docs/reference/fixtures.md"],
  ["Factories", "docs/reference/factories.md"],
  ["Caveats and escape hatches", "docs/reference/caveats.md"],
  ["Database safety", "docs/reference/safety.md"],
  ["Compatibility", "docs/reference/compatibility.md"],
  ["Sources and prior art", "docs/reference/sources.md"],
  ["Design lineage", "docs/reference/lineage/index.md"],
  ["Rails testing ecosystem", "docs/reference/lineage/rails.md"],
  ["Django and Laravel precedents", "docs/reference/lineage/frameworks.md"],
  ["TypeScript prior art", "docs/reference/lineage/typescript.md"],
  ["Agent guide", "docs/agents/index.md"],
] as const;

const full = [
  "# db-test-kit-js — complete documentation for language models",
  "",
  "Generated from the same Markdown that builds the documentation site. Prefer RECREATE.md when",
  "performing an adoption or update because it is the canonical operational checklist.",
  "",
  ...pages.flatMap(([title, file]) => [
    `\n---\n\n# ${title}\n`,
    readFileSync(resolve(root, file), "utf8")
      .replace(/^---\n[\s\S]*?\n---\n/, "")
      .trim(),
  ]),
  "",
].join("\n");

writeFileSync(resolve(root, "docs/public/llms-full.txt"), full);
