# Caveats and escape hatches

The harness makes transaction behavior fast and convenient; it does not repeal transaction semantics.
Each boundary below is pinned by a test in both variants where applicable.

## Expected failures abort transactions

Postgres marks a transaction aborted after a failed statement. Wrap an error you intend to catch in an
application-level nested transaction/savepoint. Be especially careful when application code catches its
own insert error and then tries another query.

## One connection is not concurrency

Queries issued through the wrapping transaction share one connection. A `Promise.all` can appear to pass
while operations actually serialize. Move race-sensitive assertions into a committed-mode file and run
them against real Postgres with data scoped to a tenant created by that test.

## Database time belongs to the transaction

Postgres `now()` is the transaction start time. Rows inserted later in the same test may receive identical
timestamps. Set explicit timestamps when order matters. Prisma's client-side `@default(now())` behaves
differently; raw SQL time still follows Postgres.

## Baselines are visible globally

Cross-tenant jobs and sweep queries see committed fixtures. Keep fixture dates in the past and workflow
states terminal. Scope assertions to the test tenant instead of assuming the whole database is empty.

## Committed mode leaves data behind

The real-Postgres database is disposable per run. A committed-mode test must create a unique tenant and
must never depend on another committed test's cleanup.
