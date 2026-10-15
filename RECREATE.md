# Recreate db-test-kit in your repository

Instructions for an AI agent (or a person) adding database-backed testing to a TypeScript project by
**copying** the patterns in this repo. Nothing here is an npm package: you copy source into your repo
and own it. Read this whole file before touching the target repo.

## What you are building

Three layers, each doing one job:

| Layer | Job | Where |
|---|---|---|
| **Rollback per test** | Each test runs in a transaction that is rolled back, so tests mutate freely and leave nothing behind | `test/db/harness.ts`, `test/db/setup.ts` |
| **Fixtures** | A small, realistic, read-only baseline committed once; rows keyed by label, ids derived from the label, foreign keys written `idOf(set, "label")` | `test/fixtures/` |
| **Factories** | Build whatever a test varies (fishery); lazy associations | `test/factories/` |

Plus a **session seam** (`signInAs(user)`) so server code is tested through the real tenancy check.
Why this shape: a rollback costs ~0.3 ms per test against ~58 ms to truncate every table, and fixtures
make the shared baseline free per test.

## Step 0: check this fits the target repo

Stop and tell the user if any of these is false (each has a stated workaround):

1. **Postgres + Drizzle.** (Prisma: the transaction hook and the fixture loader are the only
   ORM-specific parts; see "Porting to another ORM" at the end.)
2. **Tests can use a driver with real interactive transactions.** `node-postgres`, `postgres-js` and
   PGlite do. **Neon's HTTP driver (`drizzle-orm/neon-http`) does not**: it sends one statement per
   request. That's fine, because tests can use a local Postgres or PGlite while production keeps the
   HTTP driver; select the driver by URL in the one file that builds `db`.
3. **Vitest >= 4.1** (`aroundEach`). Check the target's version; if it has no Vitest, install it. On an
   older Vitest or on Jest, use the `beforeEach`/`afterEach` variant at the bottom of this file.
4. **Queries go through one importable `db`.** If code builds its own connections in many places,
   consolidate them first (that is also what the seam guard test enforces).

## Step 1: reconnaissance (write findings down before copying)

Find and note, with file paths:

- The module exporting the app-wide `db` (the **seam**), and how it picks a driver.
- How migrations are run (`drizzle-kit`, a custom script) and where the SQL lives.
- The id strategy of the tables you will fixture (`text` UUID, `uuid`, serial). Deterministic ids need
  `text` or `uuid` columns; serial ids need the "serial ids" note under Pitfalls.
- The tenancy/auth boundary: the function every server action calls first (`requireMembership`-like),
  and the **one** function it uses to learn who is signed in (`getSession`, `auth.api.getSession`, ...).
- Where tests live and the existing runner config.

## Step 2: copy these files

Copy from this repo into the target, keeping relative layout. Types:
**COPY** = verbatim, **ADAPT** = copy, then change what the "Adapt" column names (when your target's
module paths and folders already match, that can be nothing), **EXAMPLE** = replace with the target's
own domain. The example files only work unchanged against this repo's exact schema.

| File | Type | Adapt |
|---|---|---|
| `test/db/harness.ts` | ADAPT | the `schema` import; drop the PGlite branch if you will only use real Postgres |
| `test/db/setup.ts` | ADAPT | the two `vi.mock(...)` module paths: your `db` module and your session module; the session mock must match what your code imports |
| `test/db/bootstrap.ts` | ADAPT | migrations folder; migrator import for your driver |
| `test/db/global-setup.ts` | COPY | |
| `test/db/seam.test.ts` | ADAPT | `ROOT`/source dir and the allowed file (your `db` module) |
| `test/fixtures/runtime.ts` | COPY | change `NAMESPACE` to a fresh fixed UUID (generate with `uuidgen` or `node -p 'crypto.randomUUID()'`, then commit it; never regenerate) |
| `test/fixtures/clock.ts` | COPY | |
| `test/fixtures/index.ts`, `test/fixtures/<table>.ts` | EXAMPLE | your tables, parents first |
| `test/factories/*.ts` | EXAMPLE | your tables; keep the shape (persistence in `onCreate`, lazy associations) |
| `test/fixtures.test.ts`, `test/projects.test.ts`, `test/tasks.test.ts` | EXAMPLE | the Step 4 proofs, written against this repo's schema; rewrite for yours, keeping what each one demonstrates |
| `test/tasks.concurrency.test.ts` | EXAMPLE | the committed-mode (`useCommittedDb()`) pattern; keep it if you have any race-prone operation, skip it otherwise |
| `test/auth/session.ts` | ADAPT | shape of your session object |
| `tsconfig.json` | ADAPT | add `paths: { "@/*": ["./src/*"] }` and add `test`, `scripts` to `include`; keep the alias identical to the one in `vitest.config.ts` (and change `src` if your source isn't in `src/`) |
| `package.json` | ADAPT | scripts `"test": "vitest run"` and `"test:pg": "bash scripts/test-pg.sh"`; set `"packageManager"` (CI's `pnpm/action-setup` reads it) |
| `.gitignore` | ADAPT | make sure `node_modules` and `.env*` are ignored |
| `vitest.config.ts` | ADAPT | merge `alias`, `setupFiles`, `globalSetup` into the existing config; do not replace it |
| `test/harness-caveats.test.ts` | COPY | then fix the table/factory names it imports (`users`, `organizations`, `userFactory`) to ones you have |
| `scripts/test-pg.sh`, `docker-compose.yml`, `.github/workflows/test.yml` | ADAPT | database name (`db_test_kit` appears in all three), ports, node/pnpm versions. `test-pg.sh` defaults to `postgres:postgres@localhost:5432` to match the compose file; on a machine whose local Postgres has no `postgres` role set `TEST_PG_URL` (e.g. `postgresql://localhost:5432`) |

Install: `vitest` (>= 4.1), `fishery`, `uuid`, and `@electric-sql/pglite` if you keep the zero-setup
backend. Use the target's package manager; do not hand-edit lockfiles.

## Step 3: wire the seam

1. In `test/db/setup.ts`, `vi.mock("<your db module>")` to export `testDb` from the harness.
   The mock factory must import lazily (`await import("./harness")`), because `vi.mock` is hoisted.
2. `vi.mock("<your session module>")` so `getSession()` returns `currentSession()` from
   `test/auth/session.ts`. Mock **only** the session lookup, never the membership/authorization
   function itself: the tenant check is the thing under test.
3. If the app imports `next/headers`, `server-only` or similar framework modules, stub those in setup.

## Step 4: first fixtures, first factory, first tests

Keep the baseline small: one org, one owner user, one non-member user, a second org (for cross-tenant
assertions), and one or two rows per table you test. Fixture dates are fixed and in the past; never
`new Date()`. Then write, in this order:

1. `test/fixtures.test.ts`-style proof: baseline rows load with label-derived ids; a write in one test
   is gone in the next. **Do not skip this**; it is the proof the rollback works at all.
2. A tenancy test through a real server function: signed out rejects, signed-in non-member rejects,
   member succeeds (including any audit row), and a member of org A cannot read org B's row by id.
3. One factory-built scenario (a fresh tenant created inside the test).

## Step 5: verify (all of these, and say so in your report)

- [ ] The suite passes, and **a deliberately failing test fails**: the temporary test must query `db`
      and assert something false (a bare `expect(1).toBe(2)` never exercises `aroundEach`). Delete it
      afterward.
- [ ] The "gone in the next test" proof passes.
- [ ] `seam.test.ts` passes, and **fails** when you temporarily add `new Pool()` elsewhere in `src`.
- [ ] `harness-caveats.test.ts` passes (it pins aborted-transaction, savepoint and `now()` behavior).
- [ ] Existing tests that previously passed still pass; any that needed `useCommittedDb()` are listed.
- [ ] CI: locally run `pnpm install --frozen-lockfile && pnpm typecheck && pnpm test`, and confirm the
      workflow's `TEST_DATABASE_URL` and database name match `scripts/test-pg.sh`. (You can't run the
      workflow itself; say so.) Also run `pnpm test:pg` against a real Postgres if one is reachable.

## Pitfalls (each was hit for real)

- **A transaction callback that returns normally commits.** Rollback needs a thrown sentinel
  (`class Rollback extends Error`), caught outside. The harness does this; don't "simplify" it away.
- **A failed statement aborts the whole transaction.** After a unique violation every later query
  fails. Wrap an *expected* failure in `db.transaction(...)` (a savepoint). Beware app code that
  catches its own insert errors.
- **One connection means concurrency is fake.** `Promise.all` queries serialize, and `pg` prints a
  deprecation warning ("Calling client.query() when the client is already executing a query") when a
  test depends on parallelism. Move that test to its own file that calls `useCommittedDb()`, runs only
  on a real Postgres, and creates its own tenant. **Porting a suite to rollback can silently weaken a
  concurrency test**; scan for `Promise.all`.
- **`now()` and `defaultNow()` are the transaction start time**, so rows in one test share
  `created_at`. Never order assertions on it; set explicit timestamps.
- **Cross-tenant background work sees the fixtures.** Code that scans every org (notification sweeps,
  cron-style jobs) will see baseline rows. Keep fixture dates in the past and states terminal so
  nothing is "due".
- **Mocks are per module path.** Anything else the code under test needs from the auth library must be
  added to the session mock.
- **Serial integer ids** can't be derived from a label. Either give fixture tables `text`/`uuid` ids,
  or set explicit integer ids in fixtures and reset the sequence after loading.
- **Don't use fixtures or raw inserts to test a write path** (ledger, activation, anything with
  invariants). Call the real function; factories may do the same.
- **A committed-mode test leaves data behind.** The database is throwaway per run; scope the data to a
  tenant created inside the test.

## Do not

- Publish this as a package or add it as a dependency. Copy it.
- Mock the authorization check, the database module's methods individually, or `Date` globally to
  work around the caveats above.
- Add ORM-specific cleverness to `runtime.ts`; it is plain TypeScript apart from the `insert`/`delete`
  in `loadFixtures`.

## Variant: Vitest older than 4.1, or Jest

Replace `aroundEach` in `test/db/setup.ts` with a hook pair that holds the transaction open:

```ts
let release: (() => void) | undefined;
let finished: Promise<unknown> | undefined;

beforeEach(async () => {
  await new Promise<void>((ready, failed) => {
    finished = committedDb()
      .transaction(async (tx) => {
        setCurrent(tx);                       // expose `current` from harness.ts
        ready();
        await new Promise<void>((r) => (release = r));
        throw new Rollback();
      })
      .catch((e) => { if (!(e instanceof Rollback)) failed(e); });
  });
});
afterEach(async () => { release?.(); await finished; clearCurrent(); signOut(); });
```

## Porting to another ORM

The core idea is ORM-agnostic: hold one transaction open across a test and roll it back; derive ids
from `(table, label)`; load fixtures once. Only two places touch the ORM: the transaction hook in
`harness.ts` (`$transaction` in Prisma, `db.transaction` in Drizzle; Prisma needs the interactive form
and rewrites nested `$transaction` as savepoints in a proxy) and the delete/insert in `loadFixtures`.
Keep everything else as is. (A tested Prisma variant is planned in this repo; until then, adapt those
two places and re-run the Step 5 checklist.)
