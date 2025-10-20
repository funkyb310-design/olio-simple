@echo off
echo ============================================
echo  Clearing Cache and Restarting Olio App
echo ============================================
echo.

echo Step 1: Clearing Expo cache...
call npx expo start -c

echo.
echo ============================================
echo  App should be starting with cleared cache
echo  Scan the QR code with Expo Go app
echo ============================================
pause
