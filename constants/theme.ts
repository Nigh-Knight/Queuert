/**
 * Queuert Design System
 * Colors, typography, spacing, and component sizing
 */

import { Platform } from 'react-native';

// Color Palette
export const Colors = {
  primary: '#0072D5',
  primaryDark: '#005AA8',
  secondary: '#9095A1',
  alert: '#CA5359',
  success: '#4CAF50',
  background: '#FFFFFF',
  surfaceLight: '#F3F4F6',
  border: '#DEE1E6',
  text: {
    primary: '#171A1F',
    secondary: '#565D6D',
    disabled: '#9095A1',
  },
  // Legacy color support
  light: {
    text: '#171A1F',
    background: '#FFFFFF',
    tint: '#0072D5',
    icon: '#9095A1',
    tabIconDefault: '#9095A1',
    tabIconSelected: '#0072D5',
  },
  dark: {
    text: '#FFFFFF',
    background: '#171A1F',
    tint: '#0072D5',
    icon: '#9095A1',
    tabIconDefault: '#9095A1',
    tabIconSelected: '#0072D5',
  },
};

// Typography
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "Roboto, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Typography Scale
export const Typography = {
  h1: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  h2: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
};

// Spacing Scale
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Component Sizing
export const ComponentSize = {
  buttonHeight: 48,
  inputHeight: 47,
  cardRadius: 10,
  buttonRadius: 6,
};
