# Django and Laravel precedents

Django and Laravel are **parallel precedents**, not the direct source of the kit's API. Both reinforce the
same architectural lesson: database isolation is a first-class test-runner concern, while fixtures,
seeders, and factories serve different data-shaping jobs.

## Django

Django's `TestCase` provides transaction-backed isolation and restores a known starting state. Its
`fixtures` class attribute loads named data files for a test class. `TransactionTestCase` exists for tests
that must observe transaction behavior directly, accepting the cost of resetting the database differently.

The parallel with db-test-kit-js is the distinction between a fast default isolation path and an explicit
path for transaction-sensitive behavior. The kit's `useCommittedDb()` is not a port of Django's class API,
but it serves the same honesty: a wrapper transaction must not be used to “prove” cross-transaction behavior.

Primary source: [Django 6.1 testing tools](https://docs.djangoproject.com/en/stable/topics/testing/tools/).

## Laravel

Laravel's `RefreshDatabase` uses a transaction when the schema is current. Its documentation contrasts
that with full migration or truncation approaches, which perform more reset work. Laravel also separates
model factories from seeders: factories make test-specific records, while seeders populate broader known
data.

That resembles this kit's fixture/factory division, although the APIs and loading lifecycle differ. The
kit loads a compact committed baseline once, then rolls back factory-created variation after each test.

Primary source: [Laravel 13 database testing](https://laravel.com/framework/docs/13.x/database-testing).

## What the comparison supports

Across Rails, Django, and Laravel, the recurring design is more important than any exact method name:

1. Establish a known database state.
2. Isolate ordinary tests with transactions when the database and test shape allow it.
3. Use a separate, explicit strategy for tests that must commit or coordinate connections.
4. Keep reusable baseline data distinct from per-test variation.

db-test-kit-js packages those decisions as copyable project code because the TypeScript ecosystem does not
provide one framework-owned lifecycle shared by Vitest, every ORM, and every application database seam.
