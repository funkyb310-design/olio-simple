# 🍎 Fix iOS TurboModuleRegistry Error


## 🚨 Your Error:

```
TurboModuleRegistry.getEnforcing(...): 'PlatformConstants' could not be found.
Verify that a module by this name is registered in the native binary.
```

## 🎯 Quick Fix for iOS on Physical Device

### Option 1: Use Expo Go App (Easiest - Recommended)

This is the **fastest way** to run on your iPhone without dealing with native code:

#### Step 1: Install Expo Go on Your iPhone
1. Open **App Store** on your iPhone
2. Search for **"Expo Go"**
3. Install it (it's free)

#### Step 2: Make Sure Your iPhone and PC are on Same WiFi
- iPhone: Settings → WiFi → Connect to your network
- PC: Should be on the same WiFi network

#### Step 3: In Your Terminal
```bash
# Stop current Expo server (Ctrl+C)

# Start Expo normally
npx expo start
```

#### Step 4: Scan QR Code
1. Look at your terminal - you'll see a QR code
2. On iPhone, open **Camera app**
3. Point camera at the QR code
4. Tap the notification that appears
5. App opens in Expo Go!

---

## 📱 Troubleshooting Expo Go Connection

### Issue: "Unable to connect to Metro"

**Fix 1: Use Tunnel Mode**
```bash
npx expo start --tunnel
```
This creates a public URL that works even if you're not on the same WiFi.

**Fix 2: Manually Enter URL**
1. In terminal, note your URL: `exp://192.168.x.x:8081`
2. In Expo Go app, tap "Enter URL manually"
3. Type the URL and connect

**Fix 3: Check Firewall**
```powershell
# Allow Node through Windows Firewall
# Run PowerShell as Administrator:
New-NetFirewallRule -DisplayName "Node.js" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow
```

---

## 🔧 Option 2: Fix Native Modules (Advanced)

If you want to build a standalone app or need native modules:

### Understanding the Error:

The error occurs because:
1. You're using React Native 0.76.5
2. Some native modules aren't properly linked
3. `PlatformConstants` is a core RN module that's missing

### The Fix:

Since you're on **Windows** and want to run on **iOS device**, you have two paths:

#### Path A: Expo Development Build (Requires EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios --profile development

# When build completes, install on your iPhone
# Then run:
npx expo start --dev-client
```

This creates a custom native app with all modules properly configured.

#### Path B: Use macOS (If Available)

To run native iOS builds, you need:
- macOS computer
- Xcode installed
- iOS Simulator or connected iPhone

---

## ✅ Recommended Solution (Fastest):

### Use Expo Go App

**Why?**
- ✅ No native code compilation needed
- ✅ Works on Windows
- ✅ Instant updates
- ✅ Perfect for development
- ✅ Free and easy

**Steps:**
1. Install Expo Go on iPhone (App Store)
2. Run `npx expo start --tunnel`
3. Scan QR code with iPhone camera
4. App opens in Expo Go!

**Limitations:**
- Can't use all native modules (but most Expo modules work)
- Runs inside Expo Go container
- For production, you'll need EAS Build

---

## 📱 Complete iOS Setup Guide

### Step-by-Step:

#### 1. Install Expo Go
- Open App Store on iPhone
- Search "Expo Go"
- Install

#### 2. Check Your Network

**Find your PC's IP address:**
```powershell
ipconfig
# Look for "IPv4 Address" under your WiFi adapter
# Example: 192.168.1.100
```

**Make sure iPhone is on same WiFi**

#### 3. Update Your API URL

In `App.js`, line 45-47, update the IP:

```javascript
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:3000/api'
  : 'http://192.168.1.100:3000/api'; // ← Use YOUR PC's IP
```

#### 4. Start Backend Server
```bash
# Open new terminal
cd backend
node server.js
```

Should see:
```
✓ Server running on port 3000
✓ MongoDB connected successfully
```

#### 5. Start Expo with Tunnel
```bash
# In main project folder
npx expo start --tunnel
```

This might take a minute to start the tunnel.

#### 6. Scan QR Code
- Open Camera app on iPhone
- Point at QR code in terminal
- Tap notification
- App opens in Expo Go!

---

## 🔍 Alternative: Try LAN Mode First

```bash
# Stop current server (Ctrl+C)

# Start in LAN mode
npx expo start --lan
```

Then scan QR code with your iPhone's camera.

---

## 🐛 Common Issues

### Issue 1: "Network response timed out"

**Cause:** Firewall blocking connections

**Fix:**
```powershell
# Run as Administrator in PowerShell:
New-NetFirewallRule -DisplayName "Expo Metro" -Direction Inbound -Protocol TCP -LocalPort 8081 -Action Allow
New-NetFirewallRule -DisplayName "Expo" -Direction Inbound -Protocol TCP -LocalPort 19000,19001,19002 -Action Allow
```

### Issue 2: "Could not connect to development server"

**Fix:**
```bash
# Use tunnel mode instead
npx expo start --tunnel
```

### Issue 3: "Unable to resolve module"

**Fix:**
```bash
# Clear cache
npx expo start --clear
```

### Issue 4: QR code not scanning

**Manual connection:**
1. In Expo Go app → tap "Enter URL manually"
2. Type: `exp://YOUR_PC_IP:8081`
3. Replace YOUR_PC_IP with your actual IP (from ipconfig)

---

## 📊 Connection Modes Comparison

| Mode | Command | Best For |
|------|---------|----------|
| **LAN** | `npx expo start --lan` | Same WiFi network |
| **Tunnel** | `npx expo start --tunnel` | Different networks, firewalls |
| **Local** | `npx expo start` | Default, tries LAN first |

---

## ✨ Expected Result

After following these steps:

1. **Terminal shows:**
```
Metro waiting on exp://192.168.x.x:8081
› Press w │ open web
› Press a │ open Android  
› Press i │ open iOS (macOS only)

› Press r │ reload app
› Press m │ toggle menu

› Press ? │ show all commands
```

2. **Scan QR code** with iPhone camera

3. **Expo Go opens** with your app

4. **See orange welcome screen** on your iPhone!

---

## 🎯 What About Production?

### For Development:
✅ Use Expo Go (what we just set up)

### For Production/Distribution:
Use EAS Build to create a standalone app:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build production app
eas build --platform ios
```

This creates an `.ipa` file you can submit to App Store.

---

## 🆘 Still Having Issues?

### Check these:

1. **Both devices on same WiFi?**
   ```powershell
   # On PC:
   ipconfig
   
   # On iPhone:
   Settings → WiFi → Check network name
   ```

2. **Backend server running?**
   ```bash
   cd backend
   node server.js
   ```

3. **Firewall blocking?**
   - Try tunnel mode: `npx expo start --tunnel`

4. **Expo Go installed?**
   - Download from App Store

---

## 📱 Quick Start Commands

```bash
# Best for iOS device (recommended)
npx expo start --tunnel

# Or try LAN mode
npx expo start --lan

# Clear cache if issues
npx expo start --clear --tunnel
```

---

## ✅ Summary

**The Problem:**
- You're trying to run native iOS on Windows
- Native modules require macOS/Xcode
- `PlatformConstants` error means native build failed

**The Solution:**
1. ✅ Use **Expo Go app** on your iPhone
2. ✅ Run `npx expo start --tunnel`
3. ✅ Scan QR code with iPhone camera
4. ✅ App runs in Expo Go!

**No native build needed!** 🎉

---

Ready to try? Run this now:

```bash
npx expo start --tunnel
```

Then scan the QR code with your iPhone's camera! 📱
