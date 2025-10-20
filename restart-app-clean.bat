@echo off
echo ================================================
echo   CLEAN RESTART - Olio App
echo ================================================
echo.

echo [1/4] Stopping all Node processes...
taskkill /F /IM node.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul
echo     ✓ Stopped

echo.
echo [2/4] Starting Backend Server...
start "Olio Backend" cmd /k "cd C:\olio\olio-app\olio-simple\backend && node server.js"
timeout /t 3 /nobreak >nul
echo     ✓ Backend started on port 3000

echo.
echo [3/4] Clearing Expo cache and starting...
cd C:\olio\olio-app\olio-simple
start "Expo Server" cmd /k "npx expo start --clear"
echo     ✓ Expo starting...

echo.
echo ================================================
echo   INSTRUCTIONS:
echo ================================================
echo.
echo 1. Wait for QR code to appear in Expo window
echo 2. Make sure your phone is on SAME WiFi as PC
echo 3. Open Expo Go on your Android phone
echo 4. Scan the QR code
echo 5. Wait 20-30 seconds for app to load
echo.
echo If white/blue screen appears:
echo   - Check Expo terminal for RED errors
echo   - Check backend terminal is running
echo   - Try shaking phone and press "Reload"
echo.
echo ================================================
pause
