/**
 * user.types.ts — Authentication & user profile types.
 *
 * The app uses a local mock-auth system backed by AsyncStorage.
 * Passwords are stored as plain text only because this is a demo —
 * in production, use a proper auth provider (Firebase, Supabase, etc.).
 */

/** Persisted user record. */
export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // ⚠️ local-only demo – never do this in prod
  createdAt: string;
}

/** Payload for the register form. */
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/** Payload for the login form. */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Lightweight representation stored in auth context (no password). */
export type AuthUser = Omit<User, 'password'>;

/** Shape of the persisted auth session. */
export interface AuthSession {
  user: AuthUser;
  token: string; // mock JWT-like token
}
