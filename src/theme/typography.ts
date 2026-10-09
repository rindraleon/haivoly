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
