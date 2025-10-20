# 🔧 Troubleshooting Guide

## 🎯 Quick Diagnostic

Run this command to check your setup:
```bash
node -v && npm -v && npx expo --version
```

Expected:
- Node: v16+ or v18+
- npm: 8+
- Expo: ~54.0.13

---

## ❌ Common Errors & Solutions

### 1. "Failed to load resource: 500 (Internal Server Error)"

**What you see:**
```
Failed to load resource: the server responded with a status of 500
http://localhost:8081/index.bundle?platform=web&dev=true...
```

**Cause:** Metro bundler crashed due to incompatible dependencies

**Solution:**
```bash
# Run the automatic fix
fix-errors.bat       # Windows
./fix-errors.sh      # Mac/Linux
```

---

### 2. "MIME type 'application/json' is not executable"

**What you see:**
```
Refused to execute script from 'http://localhost:8081/index.bundle...' 
because its MIME type ('application/json') is not executable
```

**Cause:** Metro bundler returned an error message (JSON) instead of JavaScript code

**Solution:**
1. Check if there are syntax errors in your code
2. Clear cache: `npx expo start -c`
3. Reinstall dependencies: `npm install`

---

### 3. "Unable to resolve module"

**What you see:**
```
Error: Unable to resolve module react-native-maps
```

**Solution:**
```bash
npm install react-native-maps react-native-web-maps
npx expo start -c
```

---

### 4. "Port 8081 already in use"

**What you see:**
```
Error: listen EADDRINUSE: address already in use :::8081
```

**Windows Solution:**
```bash
# Find the process
netstat -ano | findstr :8081

# Kill it (replace PID with actual number)
taskkill /PID 12345 /F
```

**Mac/Linux Solution:**
```bash
# Kill the process
lsof -ti:8081 | xargs kill -9

# Or kill all Expo/Metro ports
lsof -ti:8081,19000,19001,19002 | xargs kill -9
```

---

### 5. "Network request failed" or "Cannot connect to backend"

**What you see:**
```
Error: Network request failed
or
Failed to fetch
```

**Solution:**

**Check 1: Is backend running?**
```bash
cd backend
node server.js
```

Should see:
```
✅ Server running on port 3000
✅ MongoDB connected successfully
```

**Check 2: Correct IP address?**

In `App.js`, line 45-47:
```javascript
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:3000/api'
  : 'http://172.20.10.11:3000/api'; // ← Check this IP
```

**Find your IP:**
- Windows: `ipconfig` (look for IPv4 Address)
- Mac/Linux: `ifconfig` (look for inet)

---

### 6. "Expo CLI not found"

**Solution:**
```bash
npm install -g expo-cli
# or use npx
npx expo start
```

---

### 7. "Module not found: Can't resolve '@expo/vector-icons'"

**Solution:**
```bash
npm install @expo/vector-icons
npx expo start -c
```

---

### 8. "Error: Cannot find module 'metro-config'"

**Solution:**
```bash
npm install @expo/metro-runtime
npx expo start -c
```

---

### 9. Blank white screen (no errors)

**Possible causes:**
1. JavaScript error not showing
2. Component not rendering
3. Infinite loop

**Solution:**
```bash
# Check browser console (F12)
# Look for React errors

# Clear everything and restart
npx expo start -c
```

---

### 10. "Location permission denied"

**In App:**
- Go to browser settings
- Allow location access for localhost

**Or add mock location in code:**
```javascript
setCurrentLocation({
  latitude: 51.5074,
  longitude: -0.1278,
});
```

---

## 🔍 Debug Mode

### Enable React DevTools:
```bash
npm install -g react-devtools
react-devtools
```

### Enable Metro Bundler Logs:
```bash
npx expo start --dev --minify false
```

### Check Bundle Size:
```bash
npx expo export --platform web
```

---

## 🧹 Nuclear Option (Last Resort)

If nothing else works:

```bash
# 1. Close all terminals and browsers

# 2. Delete EVERYTHING
rm -rf node_modules
rm -rf .expo
rm -rf .expo-shared
rm -rf .next
rm -rf build
rm -rf dist
rm package-lock.json
rm yarn.lock

# 3. Clear all caches
npm cache clean --force

# 4. Reinstall Node modules
npm install

# 5. Clear Expo cache and start
npx expo start -c
```

---

## 📊 Health Check

Run these to verify your setup:

```bash
# Check Node version (should be 16+ or 18+)
node --version

# Check npm version
npm --version

# Check Expo version
npx expo --version

# List installed packages
npm list --depth=0

# Check for outdated packages
npm outdated

# Verify React version
npm list react react-native

# Check if Metro is running
curl http://localhost:8081/status
```

---

## 🎨 Visual Error Guide

### ✅ Success Looks Like:
```
Metro waiting on exp://192.168.1.x:8081
› Press w │ open web
› Press a │ open Android
› Press i │ open iOS (macOS only)

Logs for your project will appear below. Press Ctrl+C to exit.
```

### ❌ Failure Looks Like:
```
Error: Unable to start server
or
Error: Port 8081 already in use
or
Error loading module...
```

---

## 🆘 Still Stuck?

### Check These Files:

1. **package.json** - Verify versions match:
   ```json
   "react": "18.3.1",
   "react-native": "0.77.7",
   "expo": "~54.0.13"
   ```

2. **metro.config.js** - Should exist in root directory

3. **App.js** - Check for syntax errors

4. **.gitignore** - Should include:
   ```
   node_modules/
   .expo/
   .expo-shared/
   ```

### Enable Detailed Logging:

```bash
# Set debug mode
set DEBUG=expo:*   # Windows
export DEBUG=expo:* # Mac/Linux

# Start with verbose logging
npx expo start --verbose
```

---

## 📞 Getting Help

If you're still having issues:

1. Check the error message in browser console (F12)
2. Check terminal for Metro bundler errors
3. Review `FIX_ERRORS.md` for detailed explanations
4. Post the error with:
   - Node version
   - npm version
   - Expo version
   - Full error message
   - What you tried

---

## ✨ Prevention Tips

1. **Always use compatible versions** - Check [Expo docs](https://docs.expo.dev/)
2. **Clear cache regularly** - `npx expo start -c`
3. **Update gradually** - Don't jump major versions
4. **Use lockfiles** - Commit `package-lock.json`
5. **Test before committing** - Run `npm install` on fresh clone

---

**Remember: Most issues are solved by clearing cache and reinstalling! 🎯**
