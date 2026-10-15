import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";
import { stamped, stampTargets } from "../scripts/stamp-version";

it("every COPY/ADAPT file carries the current kit version (run `pnpm kit:stamp`)", () => {
  const stale = stampTargets()
    .filter(({ file, kind }) => {
      const content = readFileSync(file, "utf8");
      return content !== stamped(content, kind);
    })
    .map(({ file }) => path.relative(path.resolve(import.meta.dirname, ".."), file));
  expect(stale).toEqual([]);
});

it("CHANGELOG.md has an entry for the current version", () => {
  const root = path.resolve(import.meta.dirname, "..");
  const version = readFileSync(path.join(root, "VERSION"), "utf8").trim();
  expect(readFileSync(path.join(root, "CHANGELOG.md"), "utf8")).toContain(`## ${version} `);
});

// variants/prisma carries verbatim copies of a few root files; they must not drift.
const strip = (s: string) => s.replace(/^\/\/ db-test-kit-js v.*\n/, "");
it.each([
  "test/auth/session.ts",
  "test/fixtures/clock.ts",
  "test/fixtures/index.ts",
  "test/tasks.test.ts",
  "src/session.ts",
])("variants/prisma/%s is identical to the root copy", (rel) => {
  const root = path.resolve(import.meta.dirname, "..");
  expect(strip(readFileSync(path.join(root, "variants/prisma", rel), "utf8"))).toBe(strip(readFileSync(path.join(root, rel), "utf8")));
});
