import { Platform } from 'react-native';

export type ThemeColors = {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  deep: string;
  deepest: string;
  ink: string;
  text: string;
  textSoft: string;
  muted: string;
  mutedSoft: string;
  border: string;
  soft: string;
  background: string;
  surface: string;
  white: string;
  onPrimary: string;
  gray: string;
  grayLight: string;
  danger: string;
  dangerSoft: string;
  success: string;
  warning: string;
  purpleGlow: string;
  scrim: string;
};

export const lightColors: ThemeColors = {
  primary: '#6D28D9',
  primaryLight: '#7C3AED',
  primaryDark: '#5B21B6',
  deep: '#4C1D95',
  deepest: '#2E1065',
  ink: '#3B0764',
  text: '#4C1D95',
  textSoft: '#6D28D9',
  muted: '#A78BFA',
  mutedSoft: '#C4B5FD',
  border: '#EDE9FE',
  soft: '#F5F3FF',
  background: '#F8F6FF',
  surface: '#FFFFFF',
  white: '#FFFFFF',
  onPrimary: '#FFFFFF',
  gray: '#9CA3AF',
  grayLight: '#E5E7EB',
  danger: '#F87171',
  dangerSoft: '#FEF2F2',
  success: '#10B981',
  warning: '#F59E0B',
  purpleGlow: 'rgba(109, 40, 217, 0.18)',
  scrim: 'rgba(46, 16, 101, 0.45)',
};

export const darkColors: ThemeColors = {
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  primaryDark: '#7C3AED',
  deep: '#C4B5FD',
  deepest: '#0F0716',
  ink: '#DDD6FE',
  text: '#EDE9FE',
  textSoft: '#C4B5FD',
  muted: '#8B7BA8',
  mutedSoft: '#6D5C8A',
  border: '#2E2545',
  soft: '#1B1428',
  background: '#120C1D',
  surface: '#1F1730',
  white: '#FFFFFF',
  onPrimary: '#FFFFFF',
  gray: '#8B8798',
  grayLight: '#2E2545',
  danger: '#F87171',
  dangerSoft: '#2C1618',
  success: '#34D399',
  warning: '#FBBF24',
  purpleGlow: 'rgba(139, 92, 246, 0.28)',
  scrim: 'rgba(0, 0, 0, 0.65)',
};

/**
 * Builds a style sheet once per palette. The cache belongs to this factory, so
 * each component keeps its own sheet while the object identity stays stable.
 */
export function themed<S extends object>(build: (colors: ThemeColors) => S) {
  const cache = new WeakMap<ThemeColors, S>();
  return (colors: ThemeColors): S => {
    const cached = cache.get(colors);
    if (cached) return cached;
    const created = build(colors);
    cache.set(colors, created);
    return created;
  };
}

export const fonts = {
  regular: 'Nunito_400Regular',
  medium: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extraBold: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
};

export const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

export const cardShadow = {
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
};
