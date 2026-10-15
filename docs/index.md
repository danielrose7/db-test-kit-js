---
layout: home

hero:
  name: "db-test-kit-js"
  text: "Real database tests that reset themselves"
  tagline: "A runnable TypeScript reference for transaction rollback, typed fixtures, factories, authorization seams, and the tests that do not fit inside one transaction. Copy it into your app and own the result."
  actions:
    - theme: brand
      text: Run it in five minutes
      link: /guide/quick-start
    - theme: alt
      text: Understand the architecture
      link: /guide/how-it-works

features:
  - title: Roll back every test
    details: Run production queries against Postgres inside a transaction that is guaranteed to roll back, even when the test passes.
  - title: Share a typed baseline
    details: Load a small fixture graph once. Stable label-derived IDs make relationships readable and compile-time checked.
  - title: Vary only what matters
    details: Use Fishery factories and scenarios for data that belongs to one test, with lazy associations and no cleanup ceremony.
  - title: Keep authorization real
    details: Fake the session lookup—not membership or tenancy checks—so cross-tenant boundaries are exercised through application code.
  - title: Expose transactional blind spots
    details: Executable caveat tests document aborted transactions, frozen database time, serialized concurrency, and committed-mode escape hatches.
  - title: Drizzle and Prisma
    details: Two complete projects demonstrate the shared design and the ORM-specific differences instead of hiding them behind an abstraction.
---

## This is deliberately not a package

Database test infrastructure sits directly on the seams of your application: its connection owner,
migrations, authorization boundary, schema types, and test runner. A generic dependency tends to hide
the very behavior a test suite should make obvious.

`db-test-kit-js` is a small working system to study and copy. The files marked **COPY** have stable
behavior. Files marked **ADAPT** name their intended customization points. Domain-specific fixtures,
factories, and tests are **EXAMPLE** files to replace with your own.

::: tip The promise
After setup, a test can call real application code, mutate the database freely, and finish with the
database exactly as it began. Tests that genuinely need committed concurrent transactions opt out
explicitly and run against disposable Postgres.
:::

## The model

```text
committed fixture baseline (loaded once)
                │
        BEGIN transaction
                │
       real application code
       ├── membership checks
       ├── fixture reads
       └── factory writes
                │
        ROLLBACK after test
```

Start by [running the examples](/guide/quick-start), then [choose the adoption path](/guide/choose-a-path)
that matches your ORM and application architecture.
