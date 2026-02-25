/**
 * colors.ts — Design-token palette.
 *
 * Inspired by Apple HIG / Linear / Notion: neutral base tones
 * with vibrant accent colours for affordances.
 */

export const palette = {
  // Brand accents
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  primaryDark: '#4A3CB5',

  // Semantic
  success: '#00B894',
  warning: '#FDCB6E',
  danger: '#FF6B6B',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  grey50: '#FAFAFA',
  grey100: '#F5F5F5',
  grey200: '#EEEEEE',
  grey300: '#E0E0E0',
  grey400: '#BDBDBD',
  grey500: '#9E9E9E',
  grey600: '#757575',
  grey700: '#616161',
  grey800: '#424242',
  grey900: '#212121',

  // Gradients (start → end)
  gradientStart: '#6C5CE7',
  gradientEnd: '#A29BFE',

  // Additional accents
  accentBlue: '#74B9FF',
  accentPink: '#FD79A8',
  accentOrange: '#E17055',
} as const;
