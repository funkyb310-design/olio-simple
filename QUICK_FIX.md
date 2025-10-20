# 🚀 QUICK FIX - Resolve 500 Error & MIME Type Issues

## ⚡ The Fastest Way (Recommended)

### **Windows Users:**
```bash
# Just run this:
fix-errors.bat
```

### **Mac/Linux Users:**
```bash
# Make script executable and run:
chmod +x fix-errors.sh
./fix-errors.sh
```

That's it! The script will:
1. ✅ Stop running servers
2. ✅ Clean caches
3. ✅ Reinstall dependencies with correct versions
4. ✅ Start Expo with cleared cache

---

## 🔧 Manual Fix (If Scripts Don't Work)

### Step 1: Stop Everything
```bash
# Press Ctrl+C in any running terminal
# Or close all terminal windows
```

### Step 2: Clean Everything
```bash
# Delete folders
rm -rf node_modules
rm -rf .expo
rm -rf .expo-shared

# Delete lock file
rm package-lock.json

# Clear npm cache
npm cache clean --force
```

### Step 3: Install
```bash
npm install
```

### Step 4: Start Fresh
```bash
npx expo start -c
```

Then press **`w`** for web or scan QR code for mobile.

---

## 🔍 What Was Wrong?

| Issue | Before | After | Status |
|-------|--------|-------|--------|
| React | 19.1.0 ❌ | 18.3.1 ✅ | Fixed |
| React Native | 0.81.4 ❌ | 0.77.7 ✅ | Fixed |
| React Native Web | 0.21.0 ❌ | 0.19.13 ✅ | Fixed |
| Babel Core | Missing ❌ | 7.25.0 ✅ | Added |
| Metro Runtime | Missing ❌ | 4.0.6 ✅ | Added |
| Metro Config | Missing ❌ | Created ✅ | Added |

---

## ✅ Verification

After running the fix, check versions:
```bash
npm list react react-native expo
```

Expected output:
```
├── expo@54.0.13
├── react@18.3.1
└── react-native@0.77.7
```

---

## 🎯 Testing

1. **Start the app:**
   ```bash
   npm start
   ```

2. **Press `w` for web**

3. **Expected result:**
   - ✅ No 500 errors
   - ✅ No MIME type errors
   - ✅ App loads successfully
   - ✅ Welcome screen appears

---

## 🐛 Still Having Issues?

### Issue 1: Port Already in Use
```bash
# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8081 | xargs kill -9
```

### Issue 2: Backend Not Running
```bash
cd backend
node server.js
```

Should see:
```
Server running on port 3000
MongoDB connected successfully
```

### Issue 3: Permission Errors (Mac/Linux)
```bash
sudo npm install
```

### Issue 4: Expo CLI Issues
```bash
npm install -g expo-cli
```

---

## 📱 Platform-Specific Commands

### Web Only:
```bash
npm run web
# or
npx expo start --web
```

### Android Only:
```bash
npm run android
# or
npx expo start --android
```

### iOS Only:
```bash
npm run ios
# or
npx expo start --ios
```

---

## 💡 Understanding the Errors

### Error 1: "500 Internal Server Error"
**Cause:** Metro bundler crashed trying to compile incompatible React versions

**Fix:** Downgraded to compatible versions (React 18.3.1)

### Error 2: "MIME type 'application/json' is not executable"
**Cause:** Metro bundler returned error JSON instead of JavaScript

**Fix:** Fixed bundler configuration + added Metro runtime

---

## 🎉 Success!

If you see your app's welcome screen with:
- 🟠 Orange background
- "olio" title
- "Give it away and make someone's day" subtitle
- Sign up / Login buttons

**YOU'RE DONE!** 🎊

---

## 📚 Resources

- [Expo SDK 54 Docs](https://docs.expo.dev/versions/v54.0.0/)
- [React Native 0.77 Docs](https://reactnative.dev/docs/0.77/getting-started)
- [Metro Bundler Docs](https://facebook.github.io/metro/)

---

**Need more help?** Check `FIX_ERRORS.md` for detailed explanations.
