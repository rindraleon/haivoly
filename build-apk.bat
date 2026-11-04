@echo off
REM Haivoly — Build APK local Windows
REM Prérequis: JDK17, ANDROID_HOME, Node 20+
setlocal
cd /d %~dp0

if "%ANDROID_HOME%"=="" set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
if "%JAVA_HOME%"=="" set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.11.9-hotspot

REM Backend en ligne (Render) : joignable en 4G comme en Wi-Fi.
set API_URL=https://haivoly-back.onrender.com

echo EXPO_PUBLIC_API_URL=%API_URL%> .env
echo EXPO_PUBLIC_API_URL=%API_URL%

if not exist android\gradlew (
  echo >> npx expo prebuild --platform android
  call npx expo prebuild --platform android --clean
)

cd android
echo >> Building APK Debug (arm64)...
call gradlew.bat assembleDebug -PreactNativeArchitectures=arm64-v8a
if exist app\build\outputs\apk\debug\app-debug.apk (
  echo APK genere: %CD%\app\build\outputs\apk\debug\app-debug.apk
  echo Pour installer: adb install -r app\build\outputs\apk\debug\app-debug.apk
) else (
  echo APK non trouve, voir logs
)
pause
