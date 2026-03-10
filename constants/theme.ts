import { Platform } from 'react-native';


const primaryBlue = '#2563EB'; // blue-600 from Figma
const primaryDark = '#1E3A8A'; // blue-900 for text
const secondaryBlue = '#DBEAFE'; // blue-100 for highlights
const warningOrange = '#EA580C'; // orange-600 for expiring
const dangerRed = '#DC2626'; // red-600 for expired

export const Colors = {
  light: {
    text: '#1E3A8A',
    background: '#F8FAFC',
    tint: '#2563EB',
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#2563EB',
    primary: '#2563EB',
    primaryDark: '#1E40AF',
    secondary: '#DBEAFE',
    success: '#16A34A',
    warning: '#EA580C',
    danger: '#DC2626',
    card: '#FFFFFF',
    border: '#E2E8F0',
    white: '#FFFFFF',
  },
  dark: {
    text: '#F8FAFC',
    background: '#0F172A',
    tint: '#3B82F6',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#3B82F6',
    primary: '#3B82F6', 
    primaryDark: '#1E3A8A',
    secondary: '#1E293B',
    success: '#22C55E',
    warning: '#F97316',
    danger: '#EF4444',
    card: '#1E293B',
    border: '#334155',
    white: '#FFFFFF',
  },
};
export const Fonts = Platform.select({
  ios: {
    /** iOS System design for clean medical look */
    sans: 'System', 
    serif: 'Georgia',
    rounded: 'System', // iOS supports rounded system fonts natively
    mono: 'Courier',
    bold: 'System',
  },
  android: {
    /** Android Material Design fonts */
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