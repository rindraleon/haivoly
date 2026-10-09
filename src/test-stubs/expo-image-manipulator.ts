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
