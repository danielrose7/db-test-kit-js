import { fixtures } from "./runtime";

export const userFixtures = fixtures("user", "users", {
  /** Owner of Acme. */
  olivia: { name: "Olivia Owner", email: "olivia@acme.test" },
  /** Signed in, but a member of nothing. */
  ned: { name: "Ned Nobody", email: "ned@example.test" },
});
