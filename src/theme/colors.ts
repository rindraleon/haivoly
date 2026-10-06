/**
 * Couleurs du design system Haivoly (marque, neutres, sémantiques).
 *
 * Extrait de `src/design/tokens.ts` : un fichier par famille de jetons
 * (l'ancien module reste utilisable via `@/theme`).
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

export type ColorToken = typeof colors;
