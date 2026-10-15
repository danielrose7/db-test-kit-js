import { inArray } from "drizzle-orm";
import type { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";
import { v5 as uuidv5 } from "uuid";
import type { TestDatabase } from "../db/harness";

// Rails-style fixtures: rows are declared once, keyed by label, committed
// before the tests, and referenced from other fixtures by label.
//
// Ids are derived from (table, label), so `idOf(userFixtures, "olivia")` is just
// the id, computable without loading anything (Rails' `identify(label)`).
// Foreign keys are written `idOf(set, "label")`, never as raw ids; the label is
// type-checked, and a reference that survives to load time without a row fails
// like Rails' unknown-label error.
//
// One file per table (test/fixtures/<table>.ts), listed parents-first in
// test/fixtures/index.ts.

const NAMESPACE = "6c1e5f0a-2b7d-4f3e-9d58-0a1b2c3d4e5f"; // any fixed UUID; change it per project

const referenced = new Map<string, { table: string; label: string }>();

/** Rails' `identify`: the id for a (table, label) pair. Prefer `idOf` for fixtures. */
export function identify(table: string, label: string): string {
  return uuidv5(`${table}:${label}`, NAMESPACE);
}

type IdTable = PgTable & { id: AnyPgColumn };

export type FixtureSet<T extends IdTable, L extends string> = {
  readonly table: T;
  readonly name: string;
  readonly rows: { [K in L]: Omit<T["$inferInsert"], "id"> & { id: string } };
};

export type AnyFixtureSet = FixtureSet<IdTable, string>;

/**
 * The id of the `label` fixture in `set`; use for foreign keys. Passing the set
 * (not a table-name string) makes the label compile-time checked, and means
 * there's no registry of table names to keep in sync.
 */
export function idOf<S extends AnyFixtureSet>(set: S, label: keyof S["rows"] & string): string {
  const id = identify(set.name, label);
  referenced.set(id, { table: set.name, label });
  return id;
}

/**
 * Declare one table's fixtures. Share attributes with a plain spread
 * (`{ ...DEFAULTS, name: "Olivia" }`), the typed equivalent of YAML's
 * `<<: *DEFAULTS`. Rows are checked against the table's insert type.
 */
export function fixtures<T extends IdTable, L extends string>(
  table: T,
  name: string,
  rows: Record<L, Omit<T["$inferInsert"], "id">>
): FixtureSet<T, L> {
  const withIds = Object.fromEntries(
    Object.entries<Omit<T["$inferInsert"], "id">>(rows).map(([label, row]) => [label, { ...row, id: identify(name, label) }])
  );
  return { table, name, rows: withIds } as FixtureSet<T, L>;
}

/** Insert every set in order (delete-then-insert, so reruns are idempotent). */
export async function loadFixtures(db: TestDatabase, sets: readonly AnyFixtureSet[]) {
  const idsOf = (set: AnyFixtureSet) => Object.values(set.rows).map((r) => (r as { id: string }).id);
  const known = new Set(sets.flatMap(idsOf));
  for (const [id, { table, label }] of referenced) {
    if (!known.has(id)) throw new Error(`Fixture reference ${table}:${label} points at a fixture that doesn't exist.`);
  }
  for (const set of [...sets].reverse()) {
    await db.delete(set.table).where(inArray(set.table.id, idsOf(set)));
  }
  for (const set of sets) {
    await db.insert(set.table).values(Object.values(set.rows) as never[]);
  }
}
