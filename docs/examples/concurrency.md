# Real concurrency

One rollback transaction owns one connection. That is excellent isolation, but simultaneous promises on
that client do not demonstrate independent transactions racing. A concurrency test opts out explicitly.

```ts{1,7-12}
useCommittedDb();

it("exactly one of several simultaneous claims wins", async () => {
  const task = await taskFactory.create();
  const members = await Promise.all(
    [1, 2, 3, 4].map(() => memberFactory.create({ organizationId: task.organizationId })),
  );

  const results = await Promise.all(
    members.map(async (membership) => {
      signInAs(membership.user);
      return claimTask(task.organizationId, task.id);
    }),
  );

  expect(results.filter(Boolean)).toHaveLength(1);
});
```

`useCommittedDb()` is file-scoped. Factories now commit, so this suite creates an isolated tenant rather
than changing shared fixture rows. The Drizzle root skips the test unless it is running against real
Postgres; the in-process PGlite path has only one session.

## Why this is separate

```ts
describe.skipIf(!usingRealPostgres)("claimTask (concurrent)", () => {
  // independent application calls can now use independent pool connections
});
```

This is not a slower version of every test. It is a targeted escape hatch for behavior whose subject is
commit visibility, locks, or races.

## Full source

- [Drizzle concurrency test](https://github.com/danielrose7/db-test-kit-js/blob/main/test/tasks.concurrency.test.ts)
- [Prisma concurrency test](https://github.com/danielrose7/db-test-kit-js/blob/main/variants/prisma/test/tasks.concurrency.test.ts)
- [Drizzle claim implementation](https://github.com/danielrose7/db-test-kit-js/blob/main/src/tasks.ts)
- [Prisma claim implementation](https://github.com/danielrose7/db-test-kit-js/blob/main/variants/prisma/src/tasks.ts)

See [Caveats and escape hatches](/reference/caveats) for the other boundaries pinned by tests.
