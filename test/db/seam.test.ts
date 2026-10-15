import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// The rollback harness works because every query in app code goes through the
// one `db` exported by src/db.ts, which tests replace with a proxy onto the
// test's transaction. Code that opens its own connection would commit outside
// that transaction and leak data between tests, so only src/db.ts may do it.

const ROOT = path.resolve(import.meta.dirname, "../..");
const ALLOWED = new Set(["src/db.ts"]);
const OWN_CONNECTION = /\bnew Pool\(|\bnew PGlite\(|from "pg"|from "@electric-sql\/pglite"|drizzle-orm\/(node-postgres|pglite|neon-http|postgres-js)"/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? sourceFiles(full) : /\.tsx?$/.test(name) ? [full] : [];
  });
}

describe("db seam", () => {
  it("only src/db.ts opens a database connection", () => {
    const offenders = sourceFiles(path.join(ROOT, "src"))
      .map((f) => path.relative(ROOT, f))
      .filter((rel) => !ALLOWED.has(rel))
      .filter((rel) => OWN_CONNECTION.test(readFileSync(path.join(ROOT, rel), "utf8").replace(/^\s*\/\/.*$/gm, "")));
    expect(offenders).toEqual([]);
  });
});
