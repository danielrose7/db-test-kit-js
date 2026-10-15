import { defineConfig } from "vitepress";

export default defineConfig({
  title: "db-test-kit-js",
  description: "Transactional database testing patterns for TypeScript, Drizzle, Prisma and Postgres.",
  lang: "en-US",
  base: "/db-test-kit-js/",
  cleanUrls: true,
  lastUpdated: true,
  markdown: {
    lineNumbers: true,
    theme: { light: "github-light", dark: "github-dark" },
  },
  head: [
    ["meta", { name: "theme-color", content: "#111815" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "db-test-kit-js" }],
    ["meta", { property: "og:description", content: "Fast, real database tests for TypeScript—copied into your app, not hidden in a dependency." }],
  ],
  themeConfig: {
    logo: { src: "/mark.svg", alt: "db-test-kit-js" },
    siteTitle: "db-test-kit-js",
    nav: [
      { text: "Guide", link: "/guide/quick-start" },
      { text: "Examples", link: "/examples/" },
      { text: "Reference", link: "/reference/caveats" },
      { text: "For agents", link: "/agents/" },
      { text: "v0.2", link: "https://github.com/danielrose7/db-test-kit-js/blob/main/CHANGELOG.md" },
    ],
    sidebar: [
      {
        text: "Start here",
        items: [
          { text: "Why this kit", link: "/" },
          { text: "Quick start", link: "/guide/quick-start" },
          { text: "How it works", link: "/guide/how-it-works" },
          { text: "Choose a path", link: "/guide/choose-a-path" },
        ],
      },
      {
        text: "Adopt it",
        items: [
          { text: "Drizzle", link: "/guide/drizzle" },
          { text: "Prisma", link: "/guide/prisma" },
          { text: "Update a copy", link: "/guide/updating" },
        ],
      },
      {
        text: "Examples",
        items: [
          { text: "Overview", link: "/examples/" },
          { text: "Rollback test", link: "/examples/rollback-test" },
          { text: "Fixtures + factories", link: "/examples/fixtures-factories" },
          { text: "Authorization", link: "/examples/authorization" },
          { text: "Real concurrency", link: "/examples/concurrency" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "Fixtures", link: "/reference/fixtures" },
          { text: "Factories", link: "/reference/factories" },
          { text: "Caveats", link: "/reference/caveats" },
          { text: "Database safety", link: "/reference/safety" },
          { text: "Compatibility", link: "/reference/compatibility" },
          { text: "Source index", link: "/reference/sources" },
        ],
      },
      {
        text: "Design lineage",
        items: [
          { text: "What came from where", link: "/reference/lineage/" },
          { text: "Rails ecosystem", link: "/reference/lineage/rails" },
          { text: "Django and Laravel", link: "/reference/lineage/frameworks" },
          { text: "TypeScript prior art", link: "/reference/lineage/typescript" },
        ],
      },
      {
        text: "Automation",
        items: [{ text: "Agent guide", link: "/agents/" }],
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/danielrose7/db-test-kit-js" }],
    search: { provider: "local" },
    editLink: {
      pattern: "https://github.com/danielrose7/db-test-kit-js/edit/main/docs/:path",
      text: "Improve this page",
    },
    footer: {
      message: "A reference implementation to copy from, not a dependency.",
      copyright: "Released under the MIT License.",
    },
  },
});
