/**
 * Plugin de configuration Expo — retrait de la permission RECORD_AUDIO.
 *
 * Le plugin officiel `expo-image-picker` injecte systématiquement
 * `android.permission.RECORD_AUDIO`, parce qu'il couvre la capture vidéo
 * avec bande son. Or HaiVoly ne capture que des images : tous les appels
 * utilisent `mediaTypes: ['images']`.
 *
 * Une permission non utilisée est un motif de rejet sur le Play Store
 * (obligation de justification). On la retire donc.
 *
 * La permission est ajoutée par expo-image-picker au NIVEAU CONFIG
 * (config.android.permissions), pas directement dans le manifeste : il faut
 * donc filtrer les deux, et le filtre manifeste doit passer APRÈS l'écriture
 * des permissions. D'où les deux étapes ci-dessous.
 *
 * Vérifiable par :
 *   npx expo config --type public --json  (champ android.permissions)
 *   npx expo prebuild -p android && grep RECORD_AUDIO android/app/src/main/AndroidManifest.xml
 */
const { withAndroidManifest } = require('expo/config-plugins');

const PERMISSION_A_RETIRER = 'android.permission.RECORD_AUDIO';

function retirerDeLaConfig(config) {
  if (Array.isArray(config.android?.permissions)) {
    config.android.permissions = config.android.permissions.filter(
      (permission) => permission !== PERMISSION_A_RETIRER
    );
  }
  return config;
}

module.exports = function withoutRecordAudio(config) {
  // 1. Niveau config : retire la permission avant qu'elle n'atteigne le manifeste.
  retirerDeLaConfig(config);

  // 2. Niveau manifeste : filet de sécurité, appliqué en fin de chaîne de mods.
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    const permissions = manifest['uses-permission'];

    if (Array.isArray(permissions)) {
      manifest['uses-permission'] = permissions.filter(
        (permission) => permission?.$?.['android:name'] !== PERMISSION_A_RETIRER
      );
    }

    return cfg;
  });
};
