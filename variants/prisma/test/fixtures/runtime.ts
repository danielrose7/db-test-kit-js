import { v5 as uuidv5 } from "uuid";
import type { Prisma } from "@/generated/prisma/client";

// Rails-style fixtures: rows are declared once, keyed by label, committed
// before the tests, and referenced from other fixtures by label.
//
// Ids are derived from (set name, label), so `idOf(userFixtures, "olivia")` is
// just the id, computable without loading anything (Rails' `identify(label)`).
// Foreign keys are written `idOf(set, "label")`, never as raw ids; the label is
// type-checked, and a reference that survives to load time without a row fails
// like Rails' unknown-label error. Prisma: rows are createMany inputs, so write
// scalar foreign keys (organizationId), not relations (`organization: {connect}`).
//
// One file per model (test/fixtures/<model>.ts), listed parents-first in
// test/fixtures/index.ts.

const NAMESPACE = "9a3b7c10-5e2d-4a86-b1f4-2c6d8e0f1a37"; // any fixed UUID; change it per project

const referenced = new Map<string, { set: string; label: string }>();

type ModelName = Prisma.TypeMap["meta"]["modelProps"] extends infer P ? P & string : never;
type CreateManyRow<D extends ModelName> = Extract<
  Prisma.TypeMap["model"][Capitalize<D>]["operations"]["createMany"]["args"]["data"],
  readonly unknown[]
>[number];

/** Rails' `identify`: the id for a (set, label) pair. Prefer `idOf` for fixtures. */
export function identify(set: string, label: string): string {
  return uuidv5(`${set}:${label}`, NAMESPACE);
}

export type FixtureSet<D extends ModelName, L extends string> = {
  /** Prisma delegate name on the client, e.g. "organization", "auditLog". */
  readonly delegate: D;
  readonly name: string;
  readonly rows: { [K in L]: Omit<CreateManyRow<D>, "id"> & { id: string } };
};

export type AnyFixtureSet = FixtureSet<ModelName, string>;

/**
 * The id of the `label` fixture in `set`; use for foreign keys. Passing the set
 * (not a name string) makes the label compile-time checked.
 */
export function idOf<S extends AnyFixtureSet>(set: S, label: keyof S["rows"] & string): string {
  const id = identify(set.name, label);
  referenced.set(id, { set: set.name, label });
  return id;
}

/**
 * Declare one model's fixtures. Share attributes with a plain spread
 * (`{ ...DEFAULTS, name: "Olivia" }`). Rows are checked against the model's
 * createMany input type.
 */
export function fixtures<D extends ModelName, L extends string>(
  delegate: D,
  name: string,
  rows: Record<L, Omit<CreateManyRow<D>, "id">>,
): FixtureSet<D, L> {
  const withIds = Object.fromEntries(
    Object.entries<object>(rows).map(([label, row]) => [label, { ...row, id: identify(name, label) }]),
  );
  return { delegate, name, rows: withIds } as unknown as FixtureSet<D, L>;
}

type LoaderDelegate = {
  deleteMany(args: { where: { id: { in: string[] } } }): Promise<unknown>;
  createMany(args: { data: unknown[] }): Promise<unknown>;
};
/** A Prisma client WITHOUT the app's soft-delete / append-only extensions (they refuse deletes). */
export type LoaderClient = Record<string, unknown>;

/** Insert every set in order (delete-then-insert, so reruns are idempotent). */
export async function loadFixtures(db: LoaderClient, sets: readonly AnyFixtureSet[]) {
  const idsOf = (set: AnyFixtureSet) => Object.values(set.rows).map((r) => (r as { id: string }).id);
  const known = new Set(sets.flatMap(idsOf));
  for (const [id, { set, label }] of referenced) {
    if (!known.has(id)) throw new Error(`Fixture reference ${set}:${label} points at a fixture that doesn't exist.`);
  }
  const delegate = (set: AnyFixtureSet) => db[set.delegate] as LoaderDelegate;
  for (const set of [...sets].reverse()) {
    await delegate(set).deleteMany({ where: { id: { in: idsOf(set) } } });
  }
  for (const set of sets) {
    await delegate(set).createMany({ data: Object.values(set.rows) });
  }
}
