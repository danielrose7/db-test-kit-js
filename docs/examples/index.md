# Examples

Start with behavior, then follow the code into the repository. Each example shows the smallest useful
excerpt from both implementations when the ORM changes the expression of the pattern.

| Example | What it demonstrates | Start here |
|---|---|---|
| Ordinary rollback test | A write is visible now and absent in the next test | [Read the example](/examples/rollback-test) |
| Fixtures + factories | Shared identities plus variation owned by one test | [Read the example](/examples/fixtures-factories) |
| Authorization + tenancy | Fake identity; keep the database authorization decision real | [Read the example](/examples/authorization) |
| Real concurrency | Leave the wrapper transaction when separate connections are the behavior | [Read the example](/examples/concurrency) |

## The recurring shape

```ts
it("exercises the real application", async () => {
  signInAs(fx.users.olivia);                    // replace identity lookup
  const record = await domainFactory.create(); // arrange test-owned variation
  const result = await serverFunction(record); // real auth + real queries
  expect(result).toEqual(expected);             // rollback follows automatically
});
```

There is no cleanup call in an ordinary test. Vitest's `aroundEach` owns the transaction, the application
database import points at that transaction, and the harness forces a rollback after the assertion.

## Browse the complete implementations

- [Drizzle root project](https://github.com/danielrose7/db-test-kit-js/tree/main/test)
- [Prisma 7 variant](https://github.com/danielrose7/db-test-kit-js/tree/main/variants/prisma/test)
- [Application code under test](https://github.com/danielrose7/db-test-kit-js/tree/main/src)

The excerpts explain the design; the repository tests are the executable authority.
