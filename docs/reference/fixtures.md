# Fixtures

Fixtures are the small, committed world that many tests are allowed to read. They load once before the
suite and survive each test's rollback. Use them for stable identities and relationships that make tests
easier to understand: two tenants, users with distinct roles, membership edges, and a representative
domain record or two.

Use a [factory](/reference/factories) when a record exists only to arrange one test.

## The decision rule

| Put it in a fixture when… | Build it with a factory when… |
|---|---|
| Many tests need the same identity | One test owns the record |
| Its label carries domain meaning | Its exact values are the variation under test |
| It should be present before the test starts | The test should create or mutate it |
| Relationships are shared reference context | The graph is specific to one scenario |

Keep the baseline deliberately boring. A large fixture universe creates invisible coupling: changing one
row can affect unrelated tests, and tests stop explaining the state they actually need.

## Declare a fixture set

Each table gets one file. `fixtures()` checks every row against the table's insert type and adds a stable
ID derived from the fixture-set name and label.

```ts
import { organizations } from "@/schema";
import { FIXTURE_EPOCH } from "./clock";
import { fixtures } from "./runtime";

export const organizationFixtures = fixtures(organizations, "organizations", {
  acme: { name: "Acme", slug: "fx-acme", createdAt: FIXTURE_EPOCH },
  other: { name: "Other Co", slug: "fx-other", createdAt: FIXTURE_EPOCH },
});
```

Prefer a fixed fixture clock over `new Date()`. Stable data makes snapshots, ordering, and failure output
repeatable.

## Refer to relationships by label

Use `idOf()` for foreign keys. The fixture-set argument scopes identity, and TypeScript verifies the label.

```ts
import { projects } from "@/schema";
import { organizationFixtures } from "./organizations";
import { fixtures, idOf } from "./runtime";

export const projectFixtures = fixtures(projects, "projects", {
  website: {
    organizationId: idOf(organizationFixtures, "acme"),
    name: "Website",
  },
});
```

`idOf(organizationFixtures, "acmee")` fails typechecking. The loader also rejects a reference whose row is
not included in the loaded fixture sets.

## Export a readable test API

`test/fixtures/index.ts` exposes rows through `fx` and lists fixture sets in foreign-key order:

```ts
export const fx = {
  organizations: organizationFixtures.rows,
  users: userFixtures.rows,
  projects: projectFixtures.rows,
};

export const allFixtureSets = [
  organizationFixtures,
  userFixtures,
  projectFixtures,
];
```

Tests can then say `fx.users.olivia.id` or `fx.organizations.acme.id`. Parents must precede children in
`allFixtureSets`; the loader deletes in reverse order and inserts forward.

## Loading and mutation

The suite-level setup loads fixtures into committed state. Ordinary tests may read them and can even update
or delete them inside the test transaction—the rollback restores the committed row afterward. Do not
mutate fixture objects in JavaScript, and do not let a committed-mode test alter baseline rows.

The loader is idempotent for its own deterministic IDs: it removes those rows, then inserts the declared
sets. It is not a general database reset. The database safety checks still apply.

## Rails lineage

The model comes directly from Rails fixtures: named shared records, label-based relationships, stable IDs,
and transactional tests that return to the committed baseline. This implementation uses typed TypeScript
modules and UUIDv5 instead of YAML/ERB and Active Record accessors. See
[Rails testing ecosystem](/reference/lineage/rails) for the detailed comparison.

## Copy-ready review prompt

```text
Review this repository's database-test fixtures using docs/reference/fixtures.md and RECREATE.md from
db-test-kit-js as the standard. Identify fixture rows that are test-specific and should become factories,
unstable timestamps or generated values, raw foreign-key IDs that should use typed label references,
incorrect parent-before-child load order, mutation of fixture objects, and committed-mode tests that can
modify the shared baseline. Report findings with file paths and line numbers. Do not edit files, run
destructive database commands, or assume that production and test databases are interchangeable.
```
