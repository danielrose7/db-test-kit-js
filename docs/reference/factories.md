# Factories

Factories create variation owned by one test. They provide useful defaults while keeping the test free to
override the values that matter. In this kit, Fishery supplies the factory API and the application's real
ORM writes the record inside the current rollback transaction.

Use a [fixture](/reference/fixtures) for a stable record that many tests share.

## Build and create mean different things

`build()` returns a plain object and must not touch the database. `create()` runs the `onCreate` callback,
persists through the application database seam, and returns the created record.

```ts
import { Factory } from "fishery";
import { db } from "@/db";
import { newId } from "@/id";
import { organizations } from "@/schema";

interface OrganizationBuild {
  name: string;
  slug: string;
}

interface OrganizationRecord extends OrganizationBuild {
  id: string;
}

export const organizationFactory = Factory.define<
  OrganizationBuild,
  unknown,
  OrganizationRecord
>(({ sequence, onCreate }) => {
  onCreate(async (build) => {
    const id = newId();
    await db.insert(organizations).values({ id, ...build });
    return { ...build, id };
  });

  return {
    name: `Org ${sequence}`,
    slug: `org-${sequence}-${newId().slice(-6)}`,
  };
});
```

```ts
const draft = organizationFactory.build({ name: "Not persisted" });
const saved = await organizationFactory.create({ name: "Persisted in this test" });
```

Keeping `build()` pure makes it safe for unit tests, request payloads, and expected values. It also makes a
database write visible at the call site through `await ...create()`.

## Lazy associations

A factory may create required related records, but only when the caller did not supply them. This keeps the
convenient path short without forcing every test into a wasteful or irrelevant object graph.

```ts
onCreate(async (build) => {
  const organizationId =
    build.organizationId ?? (await organizationFactory.create()).id;

  const projectId = newId();
  await db.insert(projects).values({
    id: projectId,
    organizationId,
    name: "Factory project",
  });

  const id = newId();
  await db.insert(tasks).values({ id, projectId, organizationId, title: build.title });
  return { ...build, id, projectId, organizationId };
});
```

When a shared fixture is the right parent, pass it explicitly:

```ts
const task = await taskFactory.create({
  organizationId: fx.organizations.acme.id,
  title: "Review the release",
});
```

The created task and any lazily created associations roll back together after the test.

## Defaults, sequences, and traits

- Give every required field a valid default so the shortest factory call creates a valid record.
- Use `sequence` or project ID helpers for uniqueness; do not rely on wall-clock time.
- Use traits for a small number of meaningful, reusable states—not as a second domain model.
- Accept explicit association IDs so callers can prevent implicit record creation.
- Return the values actually persisted, including generated IDs and resolved associations.

## Failure modes

Watch for factories that import an unmocked database client, write during `build()`, eagerly create an
entire graph, hide authorization setup, or return a shape different from the stored row. The harness's seam
guard should make the first mistake fail loudly outside a current transaction.

Factory defaults should not become an unofficial fixture baseline. If many tests repeatedly create the
same meaningful identity, promote only that stable context to a fixture and keep the variable records local.

## factory_bot lineage

Fishery is explicitly inspired by factory_bot. This kit adopts factories, overrides, sequences, traits,
and associations while adding an application-specific persistence boundary in `onCreate`. See
[Rails testing ecosystem](/reference/lineage/rails) and [TypeScript prior art](/reference/lineage/typescript).

## Copy-ready review prompt

```text
Review this repository's database-test factories using
https://danielrose7.github.io/db-test-kit-js/reference/factories and
https://github.com/danielrose7/db-test-kit-js/blob/main/RECREATE.md as the standard. Verify that build
operations are pure, persistence occurs only in create hooks, database writes use the transaction-aware
application seam, required associations are created lazily and can be supplied explicitly, defaults
produce valid records, returned values match persisted values, and repeated shared identities belong in
fixtures instead. Report findings with file paths and line numbers. Do not edit files or run destructive
database commands.
```
