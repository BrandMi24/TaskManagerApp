/**
 * storage.service.ts — AsyncStorage abstraction layer.
 *
 * All reads / writes go through this service so we have a
 * single place for error handling, serialisation, and key management.
 * Data is stored per-user where applicable (tasks are namespaced by userId).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthSession, User } from '../types/user.types';
import type { Task } from '../types/task.types';

// ─── Storage keys ──────────────────────────────────────────────
const KEYS = {
  AUTH_SESSION: '@taskmanager/auth_session',
  USERS: '@taskmanager/users',
  TASKS: (userId: string) => `@taskmanager/tasks_${userId}`,
  THEME: '@taskmanager/theme_mode',
} as const;

// ─── Generic helpers ───────────────────────────────────────────

/** Safely read and parse JSON from AsyncStorage. */
async function getItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (error) {
    console.error(`[Storage] getItem(${key}) failed:`, error);
    return null;
  }
}

/** Safely serialise and write JSON to AsyncStorage. */
async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[Storage] setItem(${key}) failed:`, error);
  }
}

/** Remove a single key. */
async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`[Storage] removeItem(${key}) failed:`, error);
  }
}

// ─── Auth ──────────────────────────────────────────────────────

export const StorageService = {
  // ---------- Auth Session ----------
  getSession: () => getItem<AuthSession>(KEYS.AUTH_SESSION),
  saveSession: (session: AuthSession) =>
    setItem(KEYS.AUTH_SESSION, session),
  clearSession: () => removeItem(KEYS.AUTH_SESSION),

  // ---------- User Records ----------
  getUsers: async (): Promise<User[]> => {
    return (await getItem<User[]>(KEYS.USERS)) ?? [];
  },
  saveUsers: (users: User[]) => setItem(KEYS.USERS, users),

  // ---------- Tasks (per user) ----------
  getTasks: async (userId: string): Promise<Task[]> => {
    return (await getItem<Task[]>(KEYS.TASKS(userId))) ?? [];
  },
  saveTasks: (userId: string, tasks: Task[]) =>
    setItem(KEYS.TASKS(userId), tasks),

  // ---------- Theme preference ----------
  getThemeMode: async (): Promise<'light' | 'dark'> => {
    const mode = await getItem<'light' | 'dark'>(KEYS.THEME);
    return mode ?? 'light';
  },
  saveThemeMode: (mode: 'light' | 'dark') => setItem(KEYS.THEME, mode),
} as const;
