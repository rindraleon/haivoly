# Haivoly Mobile — Expo 57 (React Native)

Application mobile agricole (parcelles, cultures, observations, interventions, récoltes, carte GPS). Expo Router, design system vert `#2E7D32`, offline-first.

## Stack

- **Expo** 57.0.15 + **React Native** 0.86.2 + **React** 19.2.3
- **Router :** `expo-router` 57 + `typedRoutes` + `reactCompiler`
- **État serveur :** `@tanstack/react-query` 5
- **Réseau :** `axios` 1.19 + `expo-constants` + `expo-network`
- **Stockage :** `expo-secure-store` 57 (natif) + `localStorage` sur web + `@react-native-async-storage`
- **Carte :** `react-native-maps` 1.27 + `expo-location` + `geolib` 3.3
- **UI :** `lucide-react-native` 1.45 (icônes uniques), `react-native-reanimated` 4.5, `react-native-gesture-handler`
- **Design :** `src/design/tokens.ts` (primary `#2E7D32`, radius, typography)

## Prérequis

- Node.js 20+ + npm 10+
- **Pour Expo Go :** l'app [Expo Go](https://expo.dev/go) sur le téléphone
- **Pour l'APK natif :** JDK 17 (Temurin), Android SDK 34 (`platform-tools`, `platforms;android-34`, `build-tools;34.0.0`) — voir section Build APK
- Backend Haivoly lancé sur `PORT 3000`

Vérifier :
```bash
node -v && npm -v
java -version  # 17.0.11 si build natif
adb --version  # si install APK via USB
```

## Installation

```bash
cd frontend
npm install
```

## Configuration — `.env`

Créer `frontend/.env` :

```env
# URL du backend accessible depuis le téléphone
# - Même WiFi : IP LAN du PC
EXPO_PUBLIC_API_URL=http://192.168.2.170:3000
# - En 4G : URL ngrok (voir Tunnel)
# EXPO_PUBLIC_API_URL=https://xxxx.ngrok-free.app
```

> `src/api/client.ts` résout l'URL ainsi : `EXPO_PUBLIC_API_URL` > `hostUri` LAN (Expo) > fallback `192.168.2.170:3000`. Logs `[API] baseURL = ...` visibles dans Metro.

Trouver l'IP LAN :
```bash
# Windows
ipconfig | findstr "IPv4.*192.168"
# macOS/Linux
hostname -I | awk '{print $1}'
# ou
ifconfig | grep "192.168"
```

## Développement — Expo Go (2 min, recommandé)

### 1. Lancer le backend
```bash
cd ../backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev   # http://localhost:3000
```

### 2. Exposer le backend si téléphone en 4G (sinon sauter)
```bash
ngrok http 3000
# Copier https://xxxx.ngrok-free.app → mettre dans frontend/.env puis relancer Expo
```

### 3. Lancer l'app (tunnel par défaut)
```bash
cd frontend
npm start              # = expo start --tunnel (recommandé, fonctionne en WiFi et 4G)
# Alternatives :
npm run start:lan      # LAN uniquement, clear cache (plus rapide en WiFi)
npm run start:tunnel   # tunnel explicite (alias de npm start)
npx expo start --tunnel --clear  # tunnel + clear cache si besoin
```

- Scanner le **QR code** avec Expo Go (Android) ou Appareil photo (iOS)
- Options dans le terminal : `w` (web), `a` (émulateur Android), `r` (reload)

**Autres commandes :**
```bash
npx expo start --web --port 19007   # version web (preview)
npx expo start --clear             # clear Metro cache (si EMFILE)
npx expo lint                      # linter (eslint-config-expo)
npx tsc --noEmit                  # vérif TypeScript (via typescript, pas tsc package)
```

## Build — APK pour appareil réel

### Option A — EAS Cloud (10 min, 0 config locale, recommandé)

```bash
npm install -g eas-cli
eas login                 # compte gratuit expo.dev
cd frontend
eas build --platform android --profile preview
# → lien expo.dev avec APK à télécharger → installer sur téléphone (autoriser sources inconnues)
```

`eas.json` déjà configuré :
```json
{ "build": { "preview": { "distribution": "internal", "android": { "buildType": "apk" } } } }
```
`app.json` déjà configuré : `package com.haivoly.mobile`, `versionCode 1`, `adaptiveIcon #1B5E20`.

### Option B — Build local Gradle (8-12 min, 4 Go RAM mini)

**Prérequis JDK/SDK (une fois) :**
```bash
# JDK 17 Temurin → https://adoptium.net
# Android SDK via Android Studio → SDK Manager → cocher :
#   platform-tools, platforms;android-34, build-tools;34.0.0
export JAVA_HOME=/opt/jdk17          # ou C:\Program Files\Eclipse Adoptium\jdk-17...
export ANDROID_HOME=$HOME/Android/Sdk  # ou %LOCALAPPDATA%\Android\Sdk
export PATH=$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH
```

**Build :**
```bash
cd frontend
# 1. Configurer l'URL backend (voir .env ci-dessus)
echo "EXPO_PUBLIC_API_URL=http://192.168.2.170:3000" > .env
# ou ngrok : echo "EXPO_PUBLIC_API_URL=https://xxxx.ngrok-free.app" > .env

# 2. Générer le dossier natif (si android/ absent)
npx expo prebuild --platform android --clean

# 3. Compiler l'APK
cd android
./gradlew assembleDebug -PreactNativeArchitectures=arm64-v8a   # APK léger 30 M
# ou universel : ./gradlew assembleDebug   # 55 M (tous arch)

# 4. APK généré
# android/app/build/outputs/apk/debug/app-debug.apk

# Installer via USB
adb install -r app/build/outputs/apk/debug/app-debug.apk
# ou copier l'APK sur le téléphone et installer manuellement
```

**Scripts fournis :**
```bash
bash build-apk.sh              # build debug arm64 + détection IP/ngrok auto
bash build-apk.sh --universal  # build universel
bash build-apk.sh --release    # build release (nécessite keystore)
# Windows : build-apk.bat
```

**APK Release signé (Play Store) :**
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore haivoly-release.keystore -alias haivoly -keyalg RSA -keysize 2048 -validity 10000
# Puis configurer android/gradle.properties :
# MYAPP_RELEASE_STORE_FILE=haivoly-release.keystore
# MYAPP_RELEASE_KEY_ALIAS=haivoly
# MYAPP_RELEASE_STORE_PASSWORD=*****
# MYAPP_RELEASE_KEY_PASSWORD=*****
```

### Vérification rapide sans APK (Expo Go tunnel)
```bash
npx expo start --tunnel   # QR → Expo Go
```

## Structure

```
src/
  api/                 # client.ts (resolveBaseUrl), auth.ts, parcelles.ts, cultures.ts...
  app/
    (auth)/            # login.tsx, register.tsx, forgot-password.tsx, reset-password.tsx
    (app)/
      (home)/          # home.tsx
      (parcelles)/     # parcelles.tsx, detail-parcelle.tsx, ajout/modifier/delimiter/historique
      (cultures)/      # cultures.tsx, detail-culture.tsx, ajout/modifier/delimiter/choisir/historique
      (observations)/  # observations.tsx
      (interventions)/ # ajout-intervention.tsx, interventions-culture.tsx
      (recoltes)/      # recoltes.tsx, ajout-recolte.tsx
      (common)/        # confirmation-suppression.tsx
  components/
    ui/                # Button, Card, Input, PasswordInput, ConfirmProvider, etc.
    layout/            # AppBottomBar.tsx
  design/              # tokens.ts (colors, typography, radius)
  features/
    auth/components/   # LoginHeader.tsx, LoginForm.tsx
    home/components/   # Header.tsx, UserSummary.tsx
  storage/             # authStorage.ts (SecureStore ↔ localStorage)
  hooks/, services/, types/
```

## Design System

- `src/design/tokens.ts` : `primary #2E7D32` (50→900), `neutral`, `success #039855`, `error #D92D20`, `background.app #F8FAF8`, `radius`, `typography` (System/Inter)
- Icônes : `lucide-react-native` uniquement (cohérent)
- `ConfirmProvider` (danger/primary) pour déconnexion et suppressions

## Qualité

```bash
npx expo lint          # ESLint (eslint-config-expo)
npx tsc --noEmit      # TypeScript (installer typescript si besoin : npm i -D typescript)
npx expo export --platform android  # vérif bundle (3862 modules, 6.9 MB) sans émettre
```

## Dépannage

- **`SecureStore.getValueWithKeyAsync is not a function` sur web** → déjà fixé (`authStorage.ts` → `localStorage` sur web)
- **Metro `EMFILE` / too many open files** → `npx expo start --clear`
- **`Network request failed` sur téléphone** → vérifier `EXPO_PUBLIC_API_URL` : en 4G utiliser `ngrok`, en WiFi vérifier IP LAN et firewall port 3000
- **Gradle `daemon disappeared` / OOM** → fermer Chrome/Android Studio, build single-arch (`-PreactNativeArchitectures=arm64-v8a`), ou utiliser EAS Cloud
- **`INSTALL_PARSE_FAILED`** → désinstaller l'ancienne version `com.haivoly.mobile` puis réinstaller

## Licence

MIT
