# Fixtures and factories together

Fixtures answer “which known actor or tenant?” Factories answer “what unusual state does this test own?” A
test can use both without rebuilding the shared world.

```ts{3,6}
it("creates a project for a member created by a factory", async () => {
  // A new tenant and user belong only to this test.
  const membership = await memberFactory.owner().create();

  signInAs(membership.user);
  const id = await createProject(membership.organizationId, "Fresh");

  expect((await listProjects(membership.organizationId)).map((p) => p.id)).toEqual([id]);
});
```

For a shared relationship, pass a fixture ID into the factory instead of creating another tenant:

```ts{2}
const task = await taskFactory.create({
  organizationId: fx.organizations.acme.id,
  title: "Review the release",
});
```

The label `acme` carries meaning across tests. The task does not; it rolls back with this test.

## A readable fixture relationship

```ts{3}
export const projectFixtures = fixtures(projects, "projects", {
  website: {
    organizationId: idOf(organizationFixtures, "acme"),
    name: "Website",
    createdAt: FIXTURE_EPOCH,
  },
});
```

`idOf()` checks the label at compile time and computes the ID without first querying the database.

## Full source

- [Drizzle project tests](https://github.com/danielrose7/db-test-kit-js/blob/main/test/projects.test.ts)
- [Drizzle fixtures](https://github.com/danielrose7/db-test-kit-js/tree/main/test/fixtures)
- [Drizzle factories](https://github.com/danielrose7/db-test-kit-js/tree/main/test/factories)
- [Prisma project tests](https://github.com/danielrose7/db-test-kit-js/blob/main/variants/prisma/test/projects.test.ts)
- [Prisma fixtures](https://github.com/danielrose7/db-test-kit-js/tree/main/variants/prisma/test/fixtures)
- [Prisma factories](https://github.com/danielrose7/db-test-kit-js/tree/main/variants/prisma/test/factories)

For the design rules behind these choices, see [Fixtures](/reference/fixtures) and
[Factories](/reference/factories).
