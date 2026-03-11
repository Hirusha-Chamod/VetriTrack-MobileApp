import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Text
    text: '#1E3A8A',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',

    // Backgrounds
    background: '#F8FAFC',
    backgroundLightBlue: '#EFF6FF',

    // Brand
    tint: '#2563EB',
    primary: '#2563EB',
    primaryDark: '#1E40AF',
    secondary: '#DBEAFE',

    // UI
    card: '#FFFFFF',
    border: '#E2E8F0',
    white: '#FFFFFF',
    transparentWhite: 'rgba(255, 255, 255, 0.3)',

    // Icons / Tabs
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#2563EB',

    // Input
    inputBackground: '#F1F5F9',
    inputBorder: '#E2E8F0',
    inputPlaceholder: '#94A3B8',

    // Status & Accents (Figma specific)
    success: '#16A34A',
    warning: '#EA580C',
    danger: '#DC2626',
    dangerLight: '#FEF2F2',
    
    // Light Background Tints (for icons and badges)
    orange50: '#FFF7ED',
    orange600: '#EA580C',
    red50: '#FEF2F2',
    red600: '#DC2626',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray600: '#4B5563',
    gray700: '#374151',
    blue50: '#EFF6FF',
    blue100: '#DBEAFE',
    blue600: '#2563EB',
    blue700: '#1D4ED8',
    purple50: '#FAF5FF',
    purple100: '#F3E8FF',
    purple600: '#9333EA',
    purple700: '#7E22CE',
    green50: '#F0FDF4',
    green100: '#DCFCE7',
    green600: '#16A34A',
    green700: '#15803D',
  },
  dark: {
    // Text
    text: '#F8FAFC',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',

    // Backgrounds
    background: '#0F172A',
    backgroundLightBlue: '#1E293B',

    // Brand
    tint: '#3B82F6',
    primary: '#3B82F6',
    primaryDark: '#1E3A8A',
    secondary: '#1E293B',

    // UI
    card: '#1E293B',
    border: '#334155',
    white: '#FFFFFF',
    transparentWhite: 'rgba(255, 255, 255, 0.2)',

    // Icons / Tabs
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#3B82F6',

    // Input
    inputBackground: '#0F172A',
    inputBorder: '#334155',
    inputPlaceholder: '#475569',

    // Status & Accents (Dark mode equivalents)
    success: '#22C55E',
    warning: '#F97316',
    danger: '#EF4444',
    dangerLight: '#2D1515',
    
    // Dark Background Tints
    orange50: '#431407',
    orange600: '#F97316',
    red50: '#450A0A',
    red600: '#EF4444',
    gray50: '#1E293B',
    gray100: '#334155',
    gray600: '#94A3B8',
    gray700: '#CBD5E1',
    blue50: '#172554',
    blue100: '#1E3A8A',
    blue600: '#3B82F6',
    blue700: '#60A5FA',
    purple50: '#3B0764',
    purple100: '#581C87',
    purple600: '#A855F7',
    purple700: '#C084FC',
    green50: '#052E16',
    green100: '#14532D',
    green600: '#22C55E',
    green700: '#4ADE80',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'System',
    mono: 'Courier',
    bold: 'System',
  },
  android: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif-medium',
    mono: 'monospace',
    bold: 'sans-serif-condensed-bold',
  },
  web: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "ui-rounded, 'SF Pro Rounded', sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace",
  },
});