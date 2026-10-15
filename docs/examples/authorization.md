# Authorization and tenancy

The session lookup is a controlled test seam. The membership query, tenant filter, domain query, and audit
write remain real.

## One matrix, several boundaries

```ts
it("rejects a signed-out caller", async () => {
  await expect(listProjects(fx.organizations.acme.id)).rejects.toThrow("Not authenticated");
});

it("rejects a signed-in user who isn't a member", async () => {
  signInAs(fx.users.ned);
  await expect(listProjects(fx.organizations.acme.id)).rejects.toThrow("Not a member");
});

it("doesn't leak another org's project", async () => {
  signInAs(fx.users.olivia);
  expect(await getProject(fx.organizations.acme.id, fx.projects.secret.id)).toBeNull();
  await expect(listProjects(fx.organizations.other.id)).rejects.toThrow("Not a member");
});
```

These are application tests, not controller mocks. They call the same functions production calls against
the real schema.

## ORM-specific assertion, same behavior

::: code-group

```ts [Drizzle]
const logs = await db
  .select()
  .from(auditLogs)
  .where(eq(auditLogs.resourceId, fx.projects.website.id));
expect(logs[0]).toMatchObject({ actorUserId: fx.users.olivia.id, action: "view" });
```

```ts [Prisma]
const logs = await prisma.auditLog.findMany({
  where: { resourceId: fx.projects.website.id },
});
expect(logs[0]).toMatchObject({ actorUserId: fx.users.olivia.id, action: "view" });
```

:::

The assertion changes with the client API. The authorization boundary does not.

## Full source

- [Drizzle tenancy suite](https://github.com/danielrose7/db-test-kit-js/blob/main/test/projects.test.ts)
- [Prisma tenancy suite](https://github.com/danielrose7/db-test-kit-js/blob/main/variants/prisma/test/projects.test.ts)
- [Application membership boundary](https://github.com/danielrose7/db-test-kit-js/blob/main/src/membership.ts)
- [Test session seam](https://github.com/danielrose7/db-test-kit-js/blob/main/test/auth/session.ts)
