@echo off
echo ================================
echo FIXING EXPO/REACT ERRORS
echo ================================
echo.

echo [1/5] Stopping any running processes...
taskkill /F /IM node.exe 2>nul
echo.

echo [2/5] Cleaning node_modules and caches...
if exist node_modules rmdir /s /q node_modules
if exist .expo rmdir /s /q .expo
if exist package-lock.json del /f /q package-lock.json
echo.

echo [3/5] Clearing npm cache...
call npm cache clean --force
echo.

echo [4/5] Installing correct dependencies...
call npm install
echo.

echo [5/5] Starting Expo with cleared cache...
echo.
echo ================================
echo SETUP COMPLETE!
echo ================================
echo.
echo Now starting Expo...
echo Press 'w' to open in web browser
echo Press 'a' for Android
echo Press 'i' for iOS
echo.
call npx expo start -c
