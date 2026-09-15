/**
 * Haivoly Design System — Tokens
 * Moderne, agricole, professionnel, épurée
 */

export const colors = {
  // Brand — Vert agriculture, profond et rassurant
  primary: {
    50: '#EDF7ED',
    100: '#D9EDD7',
    200: '#B3DBB0',
    300: '#8CC989',
    400: '#5DBB63',
    500: '#2E7D32', // main
    600: '#256628',
    700: '#1B4E1F',
    800: '#143A18',
    900: '#0F2B12',
  },
  // Neutres — complet du blanc au noir encre
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAF8', // app background (clair, très subtle green tint)
    100: '#F9FAFB',
    150: '#F2F4F7',
    200: '#EAECF0',
    300: '#D0D5DD',
    400: '#98A2B3',
    500: '#667085',
    600: '#475467',
    700: '#344054',
    800: '#1D2939',
    900: '#101828',
  },
  // Sémantiques
  success: {
    50: '#ECFDF3',
    100: '#D1FADF',
    500: '#039855',
    600: '#027A48',
    700: '#05603A',
  },
  warning: {
    50: '#FFFAEB',
    100: '#FEF0C7',
    500: '#F79009',
    600: '#DC6803',
  },
  error: {
    50: '#FEF3F2',
    100: '#FEE4E2',
    200: '#FDA29B',
    500: '#D92D20',
    600: '#B42318',
    700: '#912018',
  },
  info: {
    50: '#EFF8FF',
    100: '#D1E9FF',
    500: '#1570EF',
    600: '#175CD3',
  },
  // Backgrounds
  background: {
    app: '#F8FAF8',
    card: '#FFFFFF',
    muted: '#F2F4F7',
    overlay: 'rgba(16, 24, 40, 0.52)',
  },
  // Borders
  border: {
    default: '#EAECF0',
    strong: '#D0D5DD',
    focused: '#2E7D32',
    error: '#D92D20',
  },
} as const;

export const typography = {
  // Famille — system + Inter fallback
  fontFamily: {
    sans: 'System',
    medium: 'System',
    bold: 'System',
  },
  // Tailles (pixel, lineHeight inclus)
  size: {
    xs: 11,
    sm: 12,
    md: 13,
    base: 14,
    lg: 15,
    xl: 16,
    '2xl': 18,
    '3xl': 20,
    '4xl': 24,
    '5xl': 28,
    '6xl': 32,
  },
  lineHeight: {
    xs: 14,
    sm: 16,
    md: 18,
    base: 20,
    lg: 22,
    xl: 24,
    '2xl': 26,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 40,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 999,
} as const;

export const shadows = {
  none: {
    boxShadow: 'none',
    elevation: 0,
  } as any,
  xs: {
    boxShadow: '0 1px 2px rgba(16,24,40,.06)',
    elevation: 1,
  } as any,
  sm: {
    boxShadow: '0 1px 3px rgba(16,24,40,.06)',
    elevation: 2,
  } as any,
  md: {
    boxShadow: '0 4px 16px rgba(16,24,40,.08)',
    elevation: 4,
  } as any,
  lg: {
    boxShadow: '0 8px 32px rgba(16,24,40,.10)',
    elevation: 8,
  } as any,
  card: {
    boxShadow: '0 1px 8px rgba(16,24,40,.06)',
    elevation: 2,
  } as any,
} as const;

export const sizing = {
  inputHeight: 52,
  buttonHeight: 52,
  buttonHeightSm: 40,
  buttonHeightLg: 56,
  headerHeight: 56,
  tabBarHeight: 64,
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
} as const;

export type ColorToken = typeof colors;
export type SpacingToken = typeof spacing;
