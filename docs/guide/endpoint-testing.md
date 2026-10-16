# Where this fits: endpoint tests

Most projects have two ends of the testing spectrum and a gap in the middle.

| | Unit tests | **Endpoint tests (this kit)** | Full e2e |
|---|---|---|---|
| Entry point | A function with its collaborators mocked | A server function, Server Action or route handler, called in-process | A browser or HTTP client against a running deployment |
| Database | Mocked or absent | Real Postgres engine, real schema, real constraints | Real, shared, usually reset between runs |
| Authorization | Stubbed | Real decision, fake identity | Real login flow |
| Speed | Milliseconds | Low milliseconds per test | Seconds, plus a server to boot |
| Isolation | Trivial | Transaction rollback | Teardown scripts, unique data, or serial runs |
| Typical failure it catches | Logic bugs | Wrong query, missing tenant filter, constraint violation, missing audit write | Broken wiring, UI regressions, deployment config |

The middle column is what the kit is built for. A mock cannot tell you that your `WHERE` clause forgot
`organization_id`; a browser test can, but it takes seconds, needs a running server, and is awkward to run
dozens of times for every role and tenant combination. An endpoint test runs the real handler against the
real schema, many times, cheaply.

## What counts as an endpoint here

Anything that is the application's public entry into the data layer:

- a `"use server"` function or Server Action;
- a Next.js, Hono or Fetch-style route handler;
- a tRPC procedure or service-layer function that your controllers all delegate to.

The example app's `listProjects`, `getProject` and `createProject` are this shape. Each calls
`requireMembership`, runs a tenant-scoped query and writes an audit event. The tests call them directly, so
the tests exercise the same code a request would reach.

## Why the rollback pattern suits it

Endpoint tests tend to be many, and each needs a believable world: two tenants, a member and a
non-member, a record owned by someone else. That is the fixture-plus-factory baseline. Each test then
makes one request-shaped call and asserts on the result and on the rows left behind. Because the
whole test, including any writes the handler made, rolls back, tests don't interfere and need no cleanup,
which keeps them cheap enough to write the unglamorous cases: signed out, wrong tenant, malformed input,
duplicate submit.

```ts
it("does not return another tenant's project", async () => {
  signInAs(fx.users.olivia);                       // fake identity only
  const result = await getProject(fx.organizations.acme.id, fx.projects.secret.id);
  expect(result).toBeNull();                       // real membership + real WHERE clause
});
```

## Calling a route handler

If your endpoints are HTTP handlers, call them in-process rather than starting a server. Fetch-style
handlers take a `Request` and return a `Response`, so no socket is involved:

```ts
// Illustrative: the example app has server functions rather than HTTP routes.
import { POST } from "@/app/api/projects/route";

it("creates a project and audits it", async () => {
  signInAs(fx.users.olivia);
  const res = await POST(
    new Request("http://test/api/projects", {
      method: "POST",
      body: JSON.stringify({ organizationId: fx.organizations.acme.id, name: "Launch" }),
    }),
  );
  expect(res.status).toBe(201);
  const rows = await testDb.select().from(auditLogs).where(eq(auditLogs.action, "create"));
  expect(rows).toHaveLength(1);
});
```

Frameworks that expose an in-process client work the same way, for example Hono's `app.request()`. The
essential property is that the handler runs in the test's own process, so it imports the mocked `db` and
joins the test's transaction.

Because the session lookup is the only faked piece, there are no cookies or tokens to forge. Status codes,
validation errors and the shape of the response body are all real.

## Where to stop

The boundary is the transaction. These stay outside it, and belong to a different kind of test:

- **A separately running server.** Supertest against a spawned process, or a browser against a dev
  server, uses its own connections and cannot see your uncommitted rows. That is end-to-end territory,
  and it needs committed data and its own cleanup.
- **The real login flow.** The kit fakes the session lookup. Cookie handling, OAuth callbacks and
  session expiry need an e2e or a dedicated auth test.
- **Middleware and routing.** Calling a handler directly skips whatever runs before it, such as redirects,
  rewrites and edge middleware.
- **Genuine concurrency.** Opt the file into committed mode; see [Real concurrency](/examples/concurrency).
- **Rendering.** Nothing here checks that a page displays the data.

A healthy suite usually has all three layers: many unit tests, a broad endpoint layer built on this kit,
and a handful of e2e journeys that prove the pieces are wired together. The endpoint layer is where the
bulk of tenant-isolation, permission and data-integrity coverage tends to land.

## Related

- [How it works](/guide/how-it-works)
- [Authorization and tenancy](/examples/authorization): one matrix across several boundaries.
- [Caveats and escape hatches](/reference/caveats)
