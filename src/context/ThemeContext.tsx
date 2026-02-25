/**
 * ThemeContext.tsx — Global dark / light mode context.
 *
 * Persists the user's preference to AsyncStorage and exposes
 * the resolved `Theme` object plus a `toggleTheme` callback.
 */

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { lightTheme, darkTheme, type Theme } from '../theme/theme';
import { StorageService } from '../services/storage.service';

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  /** Hydrate theme preference on mount. */
  useEffect(() => {
    (async () => {
      const mode = await StorageService.getThemeMode();
      setIsDark(mode === 'dark');
    })();
  }, []);

  /** Toggle and persist. */
  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      StorageService.saveThemeMode(next ? 'dark' : 'light');
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: isDark ? darkTheme : lightTheme,
      isDark,
      toggleTheme,
    }),
    [isDark, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
