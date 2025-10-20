# How to Fix the 500 Error and MIME Type Issues

## **Understanding the Errors:**

### Error 1: 500 (Internal Server Error)
The Metro bundler is encountering an error while trying to bundle your JavaScript code.

### Error 2: MIME Type Error
The server is returning JSON (an error message) instead of JavaScript code, which the browser refuses to execute.

## **Root Cause:**
Your project has **incompatible dependency versions**:
- **Expo SDK 54** requires **React Native 0.77+** but you have **0.81.4** (too new/incorrect)
- You have **React 19.1.0** which is not compatible with Expo SDK 54 (needs 18.3.1)
- Missing essential dev dependencies

## **Solution:**

### Step 1: Clean Up
```bash
# Stop any running servers (Ctrl+C if running)

# Delete node_modules and lock files
rm -rf node_modules
rm package-lock.json

# Clear npm cache
npm cache clean --force

# Clear Expo cache
npx expo start -c
```

### Step 2: Install Correct Dependencies
```bash
# Install dependencies with correct versions
npm install

# This will install the corrected versions from package.json:
# - react@18.3.1
# - react-dom@18.3.1
# - react-native@0.77.7
# - react-native-web@~0.19.13
```

### Step 3: Clear All Caches
```bash
# Clear Expo cache
npx expo start --clear

# Or use the shorthand
npx expo start -c
```

### Step 4: Start Fresh
```bash
# Start the development server
npm start

# Then press 'w' to open in web browser
# Or use: npm run web
```

## **If Still Having Issues:**

### Option A: Force React Native Web Mode
If you're developing primarily for web:

```bash
# Start only web mode
npx expo start --web
```

### Option B: Check Backend Server
Make sure your backend server is running:

```bash
cd backend
node server.js
```

### Option C: Clear Everything
Nuclear option - completely reset:

```bash
# Stop all servers

# Delete everything
rm -rf node_modules
rm -rf .expo
rm -rf .expo-shared
rm package-lock.json

# Reinstall
npm install

# Start fresh
npx expo start -c
```

## **What Was Fixed:**

1. ✅ **React versions** - Downgraded from 19.1.0 → 18.3.1 (compatible with Expo 54)
2. ✅ **React Native** - Changed from 0.81.4 → 0.77.7 (compatible with Expo 54)
3. ✅ **React Native Web** - Set to ~0.19.13 (compatible version)
4. ✅ **Added Metro runtime** - Added `@expo/metro-runtime` for proper bundling
5. ✅ **Added Babel** - Added `@babel/core` for JavaScript transpilation
6. ✅ **Created metro.config.js** - Proper Metro bundler configuration

## **Common Port Issues:**

If you see `localhost:8081` errors:

```bash
# Find and kill processes on port 8081
# On Windows:
netstat -ano | findstr :8081
taskkill /PID <PID_NUMBER> /F

# On macOS/Linux:
lsof -ti:8081 | xargs kill -9
```

## **Verification:**

After running `npm install`, verify versions:

```bash
npm list react react-native expo
```

You should see:
- expo@~54.0.13
- react@18.3.1
- react-native@0.77.7

## **Next Steps:**

1. Run `npm install`
2. Run `npx expo start -c`
3. Press `w` for web or scan QR code for mobile
4. Your app should now load without MIME type errors!

## **Why This Happened:**

The error occurred because:
1. **Version mismatch** - Expo 54 tried to use features from React 18, but React 19 has breaking changes
2. **React Native version** - Incorrect RN version caused Metro bundler to fail
3. **Missing dependencies** - No babel or metro runtime for proper bundling
4. **Cache issues** - Old bundled code conflicting with new dependencies

## **Prevention:**

Always check Expo SDK compatibility:
https://docs.expo.dev/versions/latest/

For Expo SDK 54:
- React: 18.3.1
- React Native: 0.77.7
- React DOM: 18.3.1

---

**After following these steps, your errors should be resolved!**
