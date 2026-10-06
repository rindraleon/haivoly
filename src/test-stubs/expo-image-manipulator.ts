/**
 * Substitut d'`expo-image-manipulator` pour les tests unitaires (module natif).
 *
 * Les règles de compression sont testées de façon pure dans
 * `image.regles.test.ts` ; ce substitut sert seulement à rendre importable
 * `utils/image.ts` (donc `utils/photo.ts`) hors appareil.
 */
export const SaveFormat = {
  JPEG: 'jpeg',
  PNG: 'png',
  WEBP: 'webp',
} as const;

export const ImageManipulator = {
  manipulate: (uri: string) => ({
    renderAsync: async () => ({
      resize: (taille: { width?: number; height?: number }) => ({
        saveAsync: async () => ({ uri, width: taille.width ?? 0, height: taille.height ?? 0 }),
      }),
      saveAsync: async () => ({ uri, width: 0, height: 0 }),
    }),
  }),
};
