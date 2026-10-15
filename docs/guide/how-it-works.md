# How it works

The kit combines three familiar testing tools and one application seam. None is novel alone; their
composition is the useful part.

For the longer history—including the Rails APIs that directly inspired the fixture model—see
[Design lineage](/reference/lineage/). To begin from working tests instead, browse the
[example walkthroughs](/examples/).

## 1. Rollback isolation

Vitest's `aroundEach` opens an interactive transaction, makes its client current, runs the test, and
throws a private sentinel error. Throwing matters: a transaction callback that returns normally commits.
The outer harness recognizes only its own sentinel and lets every other failure reach Vitest.

Production code continues importing the normal application `db`. In singleton-style applications, the
test setup mocks that one module with a proxy to the current transaction. Access outside a test
transaction throws unless the file explicitly selected committed mode.

## 2. A committed fixture baseline

Fixtures represent the handful of records almost every test can safely read: two tenants, membership
edges, users with different authorization states, and a few domain records. They load once before the
suite, not before each test.

Rows are keyed by labels. IDs are UUIDv5 values derived from the fixture set and label, so relationships
can be declared without querying:

```ts
organizationId: idOf(organizationFixtures, "acme")
```

The label is checked by TypeScript. A misspelling fails typechecking instead of becoming a missing row at
runtime.

## 3. Factories for variation

Factories create state owned by one test. Persistence happens in Fishery's `onCreate`, leaving `build()`
pure. Associations are lazy: a task factory can create its organization and project only when the test
did not provide them.

The rule of thumb is simple:

| Data | Use |
|---|---|
| Read by many tests and rarely changed | Fixture |
| Meaningful only inside one test | Factory |
| A repeated graph or workflow state | Scenario composed from factories |

## 4. A real authorization boundary

The session lookup is fakeable; the tenant or membership check is not. Tests can say `signInAs(user)` and
then call the real server function. The database-backed authorization query, domain query, mutation, and
audit write all happen inside the same rollback transaction.

## 5. An explicit escape hatch

One transaction owns one connection. That is desirable isolation, but it cannot prove behavior that
requires independent transactions. A committed-mode file opts out, creates its own tenant, and runs only
against disposable Postgres. This makes the limitation visible rather than silently weakening a race test.

See [Caveats and escape hatches](/reference/caveats) for the executable boundaries.
