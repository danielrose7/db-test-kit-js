# db-test-kit-js

**A repo to copy from, not a dependency.** Patterns for database-backed integration tests in
TypeScript (Drizzle + Postgres), the way Rails, Django and Laravel do them: a fast committed fixture
baseline, factories for per-test variation, and every test wrapped in a rolled-back transaction.

> A little copy is better than a little dependency. There is no package to install. Take the files,
> own them, change them.

## Use it with an AI agent

Point your agent at this repo and tell it:

```text
Read https://github.com/danielrose7/db-test-kit-js/blob/main/RECREATE.md completely and recreate the
applicable database-testing pattern in this repository. Follow its checklist, preserve working pieces,
and report exactly which Step 5 checks you ran and any checks you could not run.
```

Claude Code and other Agent Skills readers can instead copy `skill/db-test-kit/` into
`.claude/skills/` (it is generated from `RECREATE.md`; `pnpm skill:sync`).

## Run it

```bash
pnpm install
pnpm test          # PGlite (in-process Postgres): nothing else to install
pnpm test:pg       # real Postgres: `docker compose up -d` first; also runs the concurrency tests
```

## Read the guide

The documentation site is built from Markdown in `docs/` and deploys as a static GitHub Pages site:
https://danielrose7.github.io/db-test-kit-js/. It includes human-oriented adoption paths plus
[llms.txt](https://danielrose7.github.io/db-test-kit-js/llms.txt),
[llms-full.txt](https://danielrose7.github.io/db-test-kit-js/llms-full.txt), and a concise agent guide.

```bash
pnpm docs:dev       # local authoring
pnpm docs:build     # production build, including agent-readable text resources
```

## Prisma?

`variants/prisma/` is the same project on Prisma 7 (real Postgres required): same domain, same tests, same
checklist. `cd variants/prisma && pnpm install && pnpm test`.

## What's in it

```
src/                      a tiny multi-tenant app: orgs, members, projects, tasks, audit log
  db.ts                   THE SEAM: the one `db` every query uses
  membership.ts           requireMembership: the tenant boundary (never mocked)
  projects.ts, tasks.ts   server functions under test (claimTask is race-prone on purpose)
test/db/                  COPY: the rollback harness, vitest setup, bootstrap, seam guard
test/fixtures/            COPY runtime.ts; EXAMPLE rows (one file per table, parents first)
test/factories/           EXAMPLE fishery factories with lazy associations
test/auth/session.ts      signInAs(user): fakes only the session lookup
test/*.test.ts            fixtures+rollback proof, tenancy matrix, caveats, concurrency
RECREATE.md               the instructions an agent follows (canonical)
```

## The three layers

1. **Rollback per test** (`test/db/harness.ts`). `aroundEach` opens a transaction, runs the test,
   then throws a sentinel so Postgres rolls back (a callback that returns normally would commit).
   The app's `db` import is mocked to a proxy onto that transaction; app-level `db.transaction()`
   becomes a savepoint. ~0.3 ms per test vs ~58 ms to `TRUNCATE` every table.
2. **Fixtures** (`test/fixtures/`). Rails-style: rows keyed by label, ids derived from
   `(table, label)`, foreign keys written `idOf(userFixtures, "olivia")` so a bad label fails
   `tsc`. Loaded once, read-only, fixed past dates.
3. **Factories** (`test/factories/`). fishery, persistence in `onCreate`, associations created
   lazily so `memberFactory.create()` alone yields a valid tenant.

Auth is faked at one point (`getSession`); the membership check runs for real, so tenant isolation is
genuinely tested.

## Honest caveats

One wrapping transaction means one connection: concurrent queries serialize, `now()` is the
transaction start, and a failed statement aborts the transaction. Each is pinned by
`test/harness-caveats.test.ts`, and races go in a `useCommittedDb()` file that needs a real Postgres
(see `test/tasks.concurrency.test.ts`). Details and the escape hatches are in `RECREATE.md`.

## CI

> Status: the workflow is validated as YAML and every command it runs is exercised locally, but it has not run on GitHub yet. Watch the first push.

`.github/workflows/test.yml` runs two jobs: PGlite (fast, no services) and a real Postgres service
container (same suite plus the concurrency tests). `.github/workflows/pages.yml` builds and deploys
the documentation after GitHub Pages is configured to use Actions.
