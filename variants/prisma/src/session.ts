// Stand-in for your auth library (Better Auth, Auth.js, Lucia, Clerk, ...).
// The tests replace this module (test/db/setup.ts) so `signInAs(user)` decides
// who is signed in; everything downstream of it, including the membership
// check, runs for real.
export type Session = { user: { id: string; email: string; name: string } } | null;

export async function getSession(): Promise<Session> {
  throw new Error("Wire getSession() to your auth library.");
}
