#!/usr/bin/env bash
set -e
# Haivoly — Build APK local (debug, arm64, installable)
# Usage: bash build-apk.sh  [--release] [--universal]
# Prérequis: JDK17, ANDROID_HOME, ngrok optionnel pour 4G

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

export JAVA_HOME="${JAVA_HOME:-/home/user/jdk17}"
export ANDROID_HOME="${ANDROID_HOME:-/home/user/android-sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

MODE="debug"
ARCH="arm64-v8a"
if [[ "$*" == *"--release"* ]]; then MODE="release"; fi
if [[ "$*" == *"--universal"* ]]; then ARCH="armeabi-v7a,arm64-v8a,x86,x86_64"; fi

# Détection IP LAN
IP=$(hostname -I 2>/dev/null | awk '{print $1}')
if [[ -z "$IP" ]]; then IP=$(ipconfig 2>/dev/null | grep -oE "192\.168\.[0-9]+\.[0-9]+" | head -1); fi
if [[ -z "$IP" ]]; then IP="192.168.2.170"; fi

# Si ngrok déjà lancé, propose son URL
NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | grep -oE "https://[a-z0-9-]+\.ngrok[^\"\"]*" | head -1 || true)

if [[ -n "$NGROK_URL" ]]; then
  echo "Ngrok détecté: $NGROK_URL"
  read -p "Utiliser ngrok (accessible 4G) ? [O/n] " use_ngrok
  if [[ "$use_ngrok" != "n" && "$use_ngrok" != "N" ]]; then
    echo "EXPO_PUBLIC_API_URL=$NGROK_URL" > .env
  else
    echo "EXPO_PUBLIC_API_URL=http://$IP:3000" > .env
  fi
else
  echo "EXPO_PUBLIC_API_URL=http://$IP:3000" > .env
  echo "Astuce 4G: lance 'ngrok http 3000' dans un autre terminal puis relance ce script."
fi

echo "EXPO_PUBLIC_API_URL=$(cat .env)"
echo "JAVA=$(java -version 2>&1 | head -1)"
echo "ANDROID_HOME=$ANDROID_HOME"
echo "MODE=$MODE ARCH=$ARCH"

# Prebuild si android/ manquant
if [[ ! -f android/gradlew ]]; then
  echo ">> npx expo prebuild --platform android"
  npx expo prebuild --platform android --clean
fi

# Ajuste gradle.properties selon RAM disponible
TOTAL_RAM_KB=$(grep MemTotal /proc/meminfo 2>/dev/null | awk '{print $2}')
if [[ -n "$TOTAL_RAM_KB" && "$TOTAL_RAM_KB" -lt 3000000 ]]; then
  echo "RAM faible ($TOTAL_RAM_KB KB) → mode éco (1024m, single arch, newArch false)"
  cat > android/gradle.properties <<EOF
org.gradle.jvmargs=-Xmx1024m -XX:MaxMetaspaceSize=256m -Dfile.encoding=UTF-8
org.gradle.parallel=false
org.gradle.workers.max=1
android.useAndroidX=true
android.enablePngCrunchInReleaseBuilds=false
reactNativeArchitectures=$ARCH
newArchEnabled=false
hermesEnabled=true
EOF
fi

# Build
cd android
if [[ "$MODE" == "release" ]]; then
  echo ">> ./gradlew assembleRelease -PreactNativeArchitectures=$ARCH"
  ./gradlew assembleRelease -PreactNativeArchitectures="$ARCH" --no-daemon 2>&1 | tee /tmp/haivoly-gradle.log
  APK="app/build/outputs/apk/release/app-release.apk"
else
  echo ">> ./gradlew assembleDebug -PreactNativeArchitectures=$ARCH"
  ./gradlew assembleDebug -PreactNativeArchitectures="$ARCH" --no-daemon 2>&1 | tee /tmp/haivoly-gradle.log
  APK="app/build/outputs/apk/debug/app-debug.apk"
fi

if [[ -f "$APK" ]]; then
  echo ""
  echo "✅ APK généré: $(pwd)/$APK ($(du -h "$APK" | cut -f1))"
  echo "   Pour installer (USB debugging): adb install -r $APK"
  echo "   Ou copie l'APK sur le téléphone et installe manuellement."
  # Copie vers workspace pour téléchargement facile
  cp "$APK" "$ROOT/../Haivoly-$(basename "$APK")" 2>/dev/null || cp "$APK" "/home/user/Haivoly-$(basename "$APK")"
  ls -lh "/home/user/Haivoly-"*.apk 2>/dev/null | head -n 5
else
  echo "❌ APK non trouvé. Vérifie /tmp/haivoly-gradle.log"
  tail -n 100 /tmp/haivoly-gradle.log
  exit 1
fi
