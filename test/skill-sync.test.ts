import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";
import { generate } from "../scripts/sync-skill";

it("skill/db-test-kit/SKILL.md is in sync with RECREATE.md (run `pnpm skill:sync`)", () => {
  const actual = readFileSync(path.resolve(import.meta.dirname, "../skill/db-test-kit/SKILL.md"), "utf8");
  expect(actual).toBe(generate());
});
