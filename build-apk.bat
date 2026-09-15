@echo off
REM Haivoly — Build APK local Windows
REM Prérequis: JDK17, ANDROID_HOME, Node 20+
setlocal
cd /d %~dp0

if "%ANDROID_HOME%"=="" set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
if "%JAVA_HOME%"=="" set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.11.9-hotspot

REM Détection IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4" ^| findstr "192.168."') do (
  for /f "tokens=1" %%b in ("%%a") do set IP=%%b
)
if "%IP%"=="" set IP=192.168.2.170

echo EXPO_PUBLIC_API_URL=http://%IP%:3000> .env
echo EXPO_PUBLIC_API_URL=http://%IP%:3000

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
