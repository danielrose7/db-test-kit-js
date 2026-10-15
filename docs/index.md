---
layout: home

hero:
  name: "FIELD GUIDE 001 · TYPESCRIPT + POSTGRES"
  text: "Real database tests. Nothing left behind."
  tagline: "A runnable reference for transaction rollback, typed fixtures, factories, authorization seams, and the tests that refuse to fit inside one transaction."
  actions:
    - theme: brand
      text: Run the kit
      link: /guide/quick-start
    - theme: alt
      text: See how it works
      link: /guide/how-it-works
    - theme: alt
      text: Browse examples
      link: /examples/
---

<TransactionSketch />

<div class="home-copy">

<p class="home-kicker">The short version</p>

## Test the application you are actually shipping.

Mock the person who signed in—not the authorization decision. Read shared fixture rows through the
real schema. Create the unusual state with factories. Call the same server function production calls.
Then roll the whole test back.

This is deliberately a reference to copy, not a package to install. Database test infrastructure sits
directly on your application's seams: its connection owner, migrations, schema types, authorization
boundary, and test runner. Those seams should stay visible.

<ol class="home-principles">
  <li><span>01</span><div><strong>A baseline worth knowing</strong><p>A few committed, label-addressed fixtures make the shared world readable without rebuilding it for every test.</p></div></li>
  <li><span>02</span><div><strong>Variation belongs to the test</strong><p>Factories create only what the example changes. Lazy associations keep setup small without making it magical.</p></div></li>
  <li><span>03</span><div><strong>Rollback is the cleanup</strong><p>The test runs inside an interactive transaction. A sentinel throw guarantees that a passing callback never commits.</p></div></li>
</ol>

<div class="home-aside">
  <p class="home-kicker">Honest by construction</p>
  <p><strong>One transaction owns one connection.</strong> That makes isolation cheap. It also means concurrency is fake, database <code>now()</code> is frozen, and an expected SQL error can abort the transaction. The kit pins those facts with tests and gives race-sensitive work an explicit committed-mode exit.</p>
</div>

<p class="home-kicker">Choose your route</p>

## Same design. Two working implementations.

The root project uses **Drizzle + PGlite** for a zero-service first run, then exercises the same suite
against Postgres. The Prisma 7 variant uses real Postgres and carries its own exact toolchain pins,
fixture types, loader, and caveat tests.

<div class="home-routes">
  <a href="./guide/drizzle"><span>DRIZZLE</span><strong>Start without a database service.</strong><em>Open the Drizzle path →</em></a>
  <a href="./guide/prisma"><span>PRISMA 7</span><strong>Start from the tested Postgres variant.</strong><em>Open the Prisma path →</em></a>
</div>

<div class="home-closing">
  <p class="home-kicker">For humans and agents</p>
  <h2>Read it here. Hand it to your coding agent. Own the result.</h2>
  <p>The rendered guide, raw Markdown, <code>RECREATE.md</code>, Agent Skill, <code>llms.txt</code>, and generated full-text reference all describe the same system.</p>
  <p><a href="./agents/">Copy the agent prompt →</a></p>
</div>

</div>
