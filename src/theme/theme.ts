/**
 * theme.ts — Centralised design-system tokens.
 *
 * Provides light / dark theme objects consumed by ThemeContext.
 * Every UI component reads from `theme.*` so it's trivial to
 * swap palettes at runtime.
 */

import { palette } from './colors';

/** Shape of a single theme variant. */
export interface Theme {
  dark: boolean;
  colors: {
    primary: string;
    primaryLight: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    danger: string;
    gradientStart: string;
    gradientEnd: string;
    placeholder: string;
    overlay: string;
    inputBackground: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  typography: {
    h1: { fontSize: number; fontWeight: '700' };
    h2: { fontSize: number; fontWeight: '700' };
    h3: { fontSize: number; fontWeight: '600' };
    body: { fontSize: number; fontWeight: '400' };
    caption: { fontSize: number; fontWeight: '400' };
    button: { fontSize: number; fontWeight: '600' };
  };
  shadow: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

/** Shared non-colour tokens. */
const baseTokens = {
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  borderRadius: { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 },
  typography: {
    h1: { fontSize: 32, fontWeight: '700' as const },
    h2: { fontSize: 24, fontWeight: '700' as const },
    h3: { fontSize: 18, fontWeight: '600' as const },
    body: { fontSize: 16, fontWeight: '400' as const },
    caption: { fontSize: 13, fontWeight: '400' as const },
    button: { fontSize: 16, fontWeight: '600' as const },
  },
};

/** Light theme — default. */
export const lightTheme: Theme = {
  dark: false,
  ...baseTokens,
  colors: {
    primary: palette.primary,
    primaryLight: palette.primaryLight,
    background: palette.grey50,
    surface: palette.white,
    card: palette.white,
    text: palette.grey900,
    textSecondary: palette.grey600,
    border: palette.grey200,
    success: palette.success,
    warning: palette.warning,
    danger: palette.danger,
    gradientStart: palette.gradientStart,
    gradientEnd: palette.gradientEnd,
    placeholder: palette.grey400,
    overlay: 'rgba(0,0,0,0.4)',
    inputBackground: palette.grey100,
  },
  shadow: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
};

/** Dark theme. */
export const darkTheme: Theme = {
  dark: true,
  ...baseTokens,
  colors: {
    primary: palette.primaryLight,
    primaryLight: palette.primary,
    background: '#0D0D0D',
    surface: '#1A1A2E',
    card: '#1A1A2E',
    text: palette.grey100,
    textSecondary: palette.grey400,
    border: '#2A2A3E',
    success: palette.success,
    warning: palette.warning,
    danger: palette.danger,
    gradientStart: palette.primary,
    gradientEnd: palette.primaryLight,
    placeholder: palette.grey600,
    overlay: 'rgba(0,0,0,0.7)',
    inputBackground: '#16213E',
  },
  shadow: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};
