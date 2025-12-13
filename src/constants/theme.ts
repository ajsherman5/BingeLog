export const Colors = {
  light: {
    // Backgrounds
    background: '#FAF9F7',
    surface: '#FFFFFF',
    surfaceSecondary: '#F5F3F0',

    // Primary - Soft Rose
    primary: '#D4A5A5',
    primaryDark: '#C48B8B',
    primaryLight: '#E8C5C5',
    primarySoft: '#FDF5F5',

    // Secondary - Soft Lavender
    secondary: '#B8A9C9',
    secondaryLight: '#D4C9E0',
    secondarySoft: '#F5F2F8',

    // Accent - Sage Green (for success states)
    accent: '#9DB4A0',
    accentLight: '#C5D6C7',
    accentSoft: '#F2F7F3',

    // Text
    text: '#2D2A26',
    textSecondary: '#5C5650',
    textTertiary: '#8A847C',
    textMuted: '#B5AFA6',

    // UI Elements
    border: '#E8E4DE',
    borderLight: '#F0EDE8',
    divider: '#EBE7E2',

    // Status
    error: '#D98B8B',
    errorSoft: '#FDF5F5',
    warning: '#E0B88A',
    success: '#9DB4A0',

    // Tab bar
    tabBar: '#FFFFFF',
    tabBarBorder: '#EBE7E2',
    tabInactive: '#B5AFA6',
    tabActive: '#D4A5A5',
  },
  dark: {
    // Backgrounds
    background: '#1A1917',
    surface: '#252320',
    surfaceSecondary: '#2F2C28',

    // Primary - Soft Rose
    primary: '#D4A5A5',
    primaryDark: '#C48B8B',
    primaryLight: '#E8C5C5',
    primarySoft: '#3D2E2E',

    // Secondary - Soft Lavender
    secondary: '#B8A9C9',
    secondaryLight: '#D4C9E0',
    secondarySoft: '#2E2A33',

    // Accent - Sage Green
    accent: '#9DB4A0',
    accentLight: '#C5D6C7',
    accentSoft: '#2A302B',

    // Text
    text: '#F5F3F0',
    textSecondary: '#D4CFC7',
    textTertiary: '#9A948B',
    textMuted: '#6B665E',

    // UI Elements
    border: '#3D3935',
    borderLight: '#333028',
    divider: '#3D3935',

    // Status
    error: '#D98B8B',
    errorSoft: '#3D2E2E',
    warning: '#E0B88A',
    success: '#9DB4A0',

    // Tab bar
    tabBar: '#252320',
    tabBarBorder: '#3D3935',
    tabInactive: '#6B665E',
    tabActive: '#D4A5A5',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 48,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 28,
  xxxl: 34,
  hero: 48,
};

export const FontWeight = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#2D2A26',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#2D2A26',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: '#2D2A26',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
};
