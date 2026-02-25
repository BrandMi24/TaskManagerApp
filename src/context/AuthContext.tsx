/**
 * AuthContext.tsx — Local mock authentication context.
 *
 * Provides register / login / logout actions with full
 * validation, loading states, and session persistence.
 */

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  AuthUser,
  LoginPayload,
  RegisterPayload,
  User,
} from '../types/user.types';
import { StorageService } from '../services/storage.service';
import { generateId, isValidEmail } from '../utils/helpers';

// ─── Context shape ─────────────────────────────────────────────
interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<string | null>;
  register: (payload: RegisterPayload) => Promise<string | null>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => null,
  register: async () => null,
  logout: async () => {},
});

// ─── Provider ──────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** Hydrate session on app launch. */
  useEffect(() => {
    (async () => {
      try {
        const session = await StorageService.getSession();
        if (session?.user) setUser(session.user);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  /** Register a new user. Returns error message string or null on success. */
  const register = useCallback(
    async (payload: RegisterPayload): Promise<string | null> => {
      const { name, email, password, confirmPassword } = payload;

      // ── Validation ──
      if (!name.trim()) return 'Name is required';
      if (!isValidEmail(email)) return 'Invalid email address';
      if (password.length < 6) return 'Password must be at least 6 characters';
      if (password !== confirmPassword) return 'Passwords do not match';

      setIsLoading(true);
      try {
        // Simulate network delay for realistic UX
        await new Promise((r) => setTimeout(r, 600));

        const users = await StorageService.getUsers();
        if (users.find((u) => u.email === email.toLowerCase())) {
          return 'An account with this email already exists';
        }

        const newUser: User = {
          id: generateId(),
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
          createdAt: new Date().toISOString(),
        };

        await StorageService.saveUsers([...users, newUser]);

        const authUser: AuthUser = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt,
        };
        await StorageService.saveSession({ user: authUser, token: generateId() });
        setUser(authUser);
        return null;
      } catch {
        return 'Something went wrong. Please try again.';
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /** Login with email + password. Returns error string or null. */
  const login = useCallback(
    async (payload: LoginPayload): Promise<string | null> => {
      const { email, password } = payload;
      if (!isValidEmail(email)) return 'Invalid email address';
      if (!password) return 'Password is required';

      setIsLoading(true);
      try {
        await new Promise((r) => setTimeout(r, 600));

        const users = await StorageService.getUsers();
        const found = users.find(
          (u) => u.email === email.toLowerCase() && u.password === password,
        );
        if (!found) return 'Invalid email or password';

        const authUser: AuthUser = {
          id: found.id,
          name: found.name,
          email: found.email,
          createdAt: found.createdAt,
        };
        await StorageService.saveSession({ user: authUser, token: generateId() });
        setUser(authUser);
        return null;
      } catch {
        return 'Something went wrong. Please try again.';
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /** Logout — clear session. */
  const logout = useCallback(async () => {
    setIsLoading(true);
    await StorageService.clearSession();
    setUser(null);
    setIsLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
