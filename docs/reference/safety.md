# Database safety

The default PGlite suite stores its database in the test process. The Postgres and Prisma paths can run
migrations, delete fixture tables, and commit data. Treat their connection strings as destructive input.

## Required posture

- Use a dedicated disposable database created for the test run.
- Give its role access only to that database.
- Name the database unmistakably as a test database.
- Keep production and staging secrets unavailable to test jobs.
- Print the selected host and database before destructive setup.
- Fail closed when the environment does not explicitly identify itself as testing.
- Never “make the tests pass” by weakening a connection-string guard.

## CI isolation

The included workflow creates a Postgres service container visible only to the job. That is the preferred
shape: migrations and committed-mode tests cannot reach application data because no application database
credential exists in the job.

## Target-repository checklist

Before loading fixtures, confirm all of these:

- `NODE_ENV` is `test`;
- the URL is not a production, preview, staging, or development URL;
- the database is disposable;
- migrations point at the same URL the tests use;
- cleanup and committed-mode tests cannot run against a shared database;
- the fixture role cannot connect to production.

The reference is adding executable URL guards before its first public release. Until those land, the
organizational isolation above is mandatory rather than optional.
