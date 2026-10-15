# A normal rollback test

The most important example is intentionally uneventful: write through the real application database,
assert the state, and omit cleanup.

```ts{2-3}
it("a test's writes are visible to it...", async () => {
  await db.update(users).set({ name: "Changed" }).where(eq(users.id, fx.users.olivia.id));
  await userFactory.create({ name: "RolledBack" });

  const [olivia] = await db.select().from(users).where(eq(users.id, fx.users.olivia.id));
  expect(olivia.name).toBe("Changed");
});
```

The next test sees the committed baseline again:

```ts{2,4}
it("...and gone in the next test", async () => {
  const [olivia] = await db.select().from(users).where(eq(users.id, fx.users.olivia.id));
  expect(olivia.name).toBe("Olivia Owner");
  expect(await db.select().from(users).where(eq(users.name, "RolledBack"))).toHaveLength(0);
});
```

The test did not reset the user or delete the factory record. The surrounding transaction was discarded.

## What wraps the test

```ts{1,3}
aroundEach(async (runTest) => {
  try {
    await inRolledBackTransaction(runTest);
  } finally {
    signOut();
  }
});
```

Inside the harness, a private error forces rollback because an interactive transaction callback that
returns normally would commit:

```ts{7}
await committedDb().transaction(async (tx) => {
  current = tx as unknown as TestDatabase;
  try {
    await runTest();
  } finally {
    current = undefined;
  }
  throw new Rollback();
});
```

## Full source

- [Drizzle fixture and rollback tests](https://github.com/danielrose7/db-test-kit-js/blob/main/test/fixtures.test.ts)
- [Drizzle transaction setup](https://github.com/danielrose7/db-test-kit-js/blob/main/test/db/setup.ts)
- [Drizzle harness](https://github.com/danielrose7/db-test-kit-js/blob/main/test/db/harness.ts)
- [Prisma fixture and rollback tests](https://github.com/danielrose7/db-test-kit-js/blob/main/variants/prisma/test/fixtures.test.ts)
- [Prisma harness](https://github.com/danielrose7/db-test-kit-js/blob/main/variants/prisma/test/db/harness.ts)
