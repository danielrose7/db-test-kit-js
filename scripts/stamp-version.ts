import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

// Stamps the kit version on the first line of every COPY/ADAPT file so a copy
// in another repo can tell which version it came from. Edit VERSION and
// CHANGELOG.md, then `pnpm kit:stamp`. (test/kit-version.test.ts fails if a
// file is stale.) Prisma-variant copies are stamped too.

const root = path.resolve(import.meta.dirname, "..");

type Kind = "COPY" | "ADAPT";
const FILES: Record<string, Kind> = {
  "test/db/harness.ts": "ADAPT",
  "test/db/setup.ts": "ADAPT",
  "test/db/bootstrap.ts": "ADAPT",
  "test/db/global-setup.ts": "COPY",
  "test/db/seam.test.ts": "ADAPT",
  "test/fixtures/runtime.ts": "COPY",
  "test/fixtures/clock.ts": "COPY",
  "test/auth/session.ts": "ADAPT",
  "test/harness-caveats.test.ts": "COPY",
};
const PRISMA_FILES: Record<string, Kind> = {
  "test/db/harness.ts": "ADAPT",
  "test/db/setup.ts": "ADAPT",
  "test/db/global-setup.ts": "ADAPT",
  "test/db/seam.test.ts": "ADAPT",
  "test/fixtures/runtime.ts": "COPY",
  "test/fixtures/clock.ts": "COPY",
  "test/auth/session.ts": "ADAPT",
  "test/harness-caveats.test.ts": "COPY",
};

export const version = () => readFileSync(path.join(root, "VERSION"), "utf8").trim();
const HEADER = /^\/\/ db-test-kit-js v\S+ · (COPY|ADAPT) /;

export function header(kind: Kind) {
  return `// db-test-kit-js v${version()} · ${kind} · when updating a copy, read CHANGELOG.md since this version\n`;
}

export function stampTargets(): { file: string; kind: Kind }[] {
  return [
    ...Object.entries(FILES).map(([f, kind]) => ({ file: path.join(root, f), kind })),
    ...Object.entries(PRISMA_FILES).map(([f, kind]) => ({ file: path.join(root, "variants/prisma", f), kind })),
  ];
}

export function stamped(content: string, kind: Kind) {
  const lines = content.split("\n");
  if (HEADER.test(lines[0])) lines.shift();
  return header(kind) + lines.join("\n");
}

if (process.argv[1] === import.meta.filename) {
  for (const { file, kind } of stampTargets()) writeFileSync(file, stamped(readFileSync(file, "utf8"), kind));
  console.log(`stamped v${version()}`);
}
