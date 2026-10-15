// db-test-kit-js v0.2 · ADAPT · when updating a copy, read CHANGELOG.md since this version
// Who the app thinks is signed in. Default is signed out; setup.ts resets it
// after every test.
type SessionUser = { id: string; email: string; name: string };

let current: { user: SessionUser } | null = null;

export const currentSession = () => current;
export const signInAs = (u: SessionUser) => {
  current = { user: { id: u.id, email: u.email, name: u.name } };
};
export const signOut = () => {
  current = null;
};
