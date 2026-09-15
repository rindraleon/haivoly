@echo off
echo === Haivoly Tunnel (Expo + Backend) ===
echo.
echo 1. Backend : assure-toi que .env a DATABASE_URL=postgresql://postgres:PgAdmin@localhost:5432/HaiVoly
echo    et que le backend tourne sur http://0.0.0.0:3000
echo    -> dans un 1er terminal : cd backend ^&^& npm run start:dev
echo.
echo 2. Expose le backend pour le tunnel (choisis UNE option) :
echo    Option A (simple, WiFi commun) : ne fais rien, le tunnel Expo + IP LAN suffit si PC et mobile sur meme WiFi
echo    Option B (4G / WiFi different) : dans un 2e terminal : npx ngrok http 3000 --host-header=rewrite
echo       puis copie l'URL https://xxxx.ngrok-free.app dans frontend\.env :
echo       EXPO_PUBLIC_API_URL=https://xxxx.ngrok-free.app
echo.
echo 3. Lance Expo en tunnel :
echo.
npx expo start --tunnel --clear --max-workers 2
pause
