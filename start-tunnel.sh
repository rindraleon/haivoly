#!/bin/bash
echo "=== Haivoly Tunnel (Expo + Backend) ==="
echo ""
echo "1. Backend : cd backend && npm run start:dev (port 3000)"
echo "2. Expose backend si besoin 4G : ngrok http 3000  -> copie https://xxx.ngrok-free.app dans frontend/.env"
echo "   EXPO_PUBLIC_API_URL=https://xxx.ngrok-free.app"
echo "3. Expo tunnel :"
npx expo start --tunnel --clear --max-workers 2
