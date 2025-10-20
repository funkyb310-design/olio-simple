@echo off
echo ========================================
echo Starting Olio App for iPhone
echo ========================================
echo.

echo [Step 1/3] Starting Backend Server...
start "Backend Server" cmd /k "cd backend && node server.js"
timeout /t 5 /nobreak > nul
echo Backend started!
echo.

echo [Step 2/3] Starting Expo with Tunnel...
echo Wait for QR code to appear...
echo.
npx expo start --tunnel --clear

echo.
echo ========================================
echo To connect:
echo 1. Open Camera on iPhone
echo 2. Scan QR code
echo 3. Wait for bundle to load (30-60 sec)
echo ========================================
