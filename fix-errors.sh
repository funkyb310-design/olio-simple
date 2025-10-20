#!/bin/bash

echo "================================"
echo "FIXING EXPO/REACT ERRORS"
echo "================================"
echo ""

echo "[1/5] Stopping any running processes..."
# Kill processes on common Expo/Metro ports
lsof -ti:8081,19000,19001,19002 | xargs kill -9 2>/dev/null || true
echo ""

echo "[2/5] Cleaning node_modules and caches..."
rm -rf node_modules
rm -rf .expo
rm -rf .expo-shared
rm -f package-lock.json
echo ""

echo "[3/5] Clearing npm cache..."
npm cache clean --force
echo ""

echo "[4/5] Installing correct dependencies..."
npm install
echo ""

echo "[5/5] Starting Expo with cleared cache..."
echo ""
echo "================================"
echo "SETUP COMPLETE!"
echo "================================"
echo ""
echo "Now starting Expo..."
echo "Press 'w' to open in web browser"
echo "Press 'a' for Android"
echo "Press 'i' for iOS"
echo ""
npx expo start -c
