# 📱 Run on Your iPhone - Quick Guide

## ⚡ 3-Minute Setup

### Step 1: Install Expo Go (1 min)
1. Open **App Store** on your iPhone
2. Search: **"Expo Go"**
3. Tap **Get** → **Install**

### Step 2: Connect to Same WiFi (30 sec)
- **iPhone:** Settings → WiFi → Connect to your network
- **PC:** Should already be connected to same WiFi

### Step 3: Start Expo with Tunnel (30 sec)
```bash
# In your terminal (where Expo is running):
# Press Ctrl+C to stop current server

# Then run:
npx expo start --tunnel
```

Wait for the QR code to appear (takes ~30-60 seconds)

### Step 4: Scan & Run (30 sec)
1. Open **Camera** app on iPhone
2. Point at the **QR code** in terminal
3. Tap the **notification** that appears
4. App opens in **Expo Go**!

**That's it!** 🎉

---

## 🎯 Visual Guide

```
PC Terminal                    iPhone
┌──────────────────┐          ┌──────────────┐
│                  │          │              │
│  [QR CODE HERE]  │  ←scan─  │  📷 Camera   │
│                  │          │              │
└──────────────────┘          └──────────────┘
        │                            │
        │                            ↓
        │                     ┌──────────────┐
        │                     │ Tap banner   │
        │                     └──────────────┘
        │                            │
        └────────────────────────────↓
                              ┌──────────────┐
                              │  Expo Go     │
                              │  Opens! 🎊   │
                              └──────────────┘
```

---

## 🔧 If QR Code Doesn't Work

### Method 1: Manual Entry
1. In terminal, look for: `exp://192.168.x.x:8081`
2. Open **Expo Go** app on iPhone
3. Tap **"Enter URL manually"**
4. Type the URL
5. Tap **Connect**

### Method 2: Email Yourself
1. In terminal, note the URL
2. Email it to yourself
3. Open email on iPhone
4. Tap the link
5. Opens in Expo Go!

### Method 3: Use Tunnel (Recommended)
```bash
npx expo start --tunnel
```
This creates a public URL that works even without same WiFi.

---

## 🚀 Complete Setup (First Time)

### On Your PC:

#### 1. Make Sure Backend is Running
```bash
# Open NEW terminal window
cd backend
node server.js
```

Should see:
```
✓ Server running on port 3000
✓ MongoDB connected successfully
```

#### 2. Find Your PC's IP Address
```bash
ipconfig
```
Look for **"IPv4 Address"** (e.g., 192.168.1.100)

#### 3. Update App.js with Your IP
Open `App.js`, find line 45-47:
```javascript
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:3000/api'
  : 'http://192.168.1.100:3000/api'; // ← Change to YOUR IP
```

#### 4. Start Expo
```bash
npx expo start --tunnel
```

### On Your iPhone:

#### 1. Install Expo Go from App Store

#### 2. Make Sure You're on WiFi
Settings → WiFi → Connect

#### 3. Open Camera & Scan QR Code
Or open Expo Go app and enter URL manually

---

## 🎯 What You Should See

### On PC Terminal:
```
› Metro waiting on exp://192.168.x.x:8081
› Logs for your project will appear below.

› Press ? │ show all commands

[QR CODE appears here]

› Press w │ open web
› Press a │ open Android
› Press s │ switch to development build
```

### On iPhone:
1. Camera shows QR code notification
2. Tap notification → "Open in Expo Go"
3. Expo Go launches
4. Orange welcome screen appears!
5. "olio" title visible
6. Sign up / Login buttons work

---

## 🐛 Troubleshooting

### Problem: "Unable to connect to Metro"

**Solution 1:** Use tunnel mode
```bash
npx expo start --tunnel
```

**Solution 2:** Check firewall
```powershell
# Run PowerShell as Administrator:
New-NetFirewallRule -DisplayName "Expo" -Direction Inbound -Protocol TCP -LocalPort 8081,19000,19001,19002 -Action Allow
```

**Solution 3:** Restart both
- Close Expo Go on iPhone
- Stop Expo (Ctrl+C)
- Start again: `npx expo start --tunnel`
- Re-scan QR code

---

### Problem: "Network response timed out"

**Solution:** Backend not accessible from iPhone

1. **Update API URL in App.js** with your PC's IP:
```javascript
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:3000/api'
  : 'http://YOUR_PC_IP:3000/api'; // ← Replace YOUR_PC_IP
```

2. **Allow backend through firewall:**
```powershell
New-NetFirewallRule -DisplayName "Node Backend" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

---

### Problem: "This QR code is not valid"

**Solution:** Use tunnel mode
```bash
npx expo start --tunnel
```
Tunnel mode creates a globally accessible URL.

---

### Problem: App crashes on launch

**Solution:** Clear cache
```bash
npx expo start --clear --tunnel
```

---

## 📊 Connection Methods

### Method 1: LAN (Same WiFi)
```bash
npx expo start --lan
```
**Pros:** Fast, low latency  
**Cons:** Requires same WiFi, firewall issues

### Method 2: Tunnel (Recommended for iPhone)
```bash
npx expo start --tunnel
```
**Pros:** Works anywhere, bypasses firewall  
**Cons:** Slightly slower, requires internet

### Method 3: Local
```bash
npx expo start
```
**Pros:** Default behavior  
**Cons:** May not work across networks

---

## ✅ Success Checklist

- [ ] Expo Go installed on iPhone
- [ ] iPhone and PC on same WiFi (or using tunnel)
- [ ] Backend server running (`cd backend && node server.js`)
- [ ] API_BASE_URL updated with PC's IP
- [ ] Expo started with `npx expo start --tunnel`
- [ ] QR code visible in terminal
- [ ] Scanned QR code with iPhone camera
- [ ] App opened in Expo Go
- [ ] Orange welcome screen visible
- [ ] No errors in Expo Go

---

## 🎉 You're Running on iPhone!

Once you see the orange screen with "olio" on your iPhone:

✅ You're running natively on iOS  
✅ All features work (camera, location, etc.)  
✅ Hot reload enabled (changes update instantly)  
✅ Can test real device features  

---

## 🔄 Making Changes

After setup, every time you change code:

1. **Save the file**
2. **App auto-refreshes** on iPhone
3. **See changes instantly!**

Or manually refresh:
- **Shake iPhone** → "Reload"
- Or press **'r'** in terminal

---

## 📱 Multiple Devices

You can connect multiple devices:
- Scan same QR code on different phones
- All devices update together
- Perfect for testing

---

## 💡 Pro Tips

### Tip 1: Keep Terminal Visible
Keep the terminal with QR code visible so you can:
- Check logs
- Reload app (press 'r')
- See errors

### Tip 2: Use Development Mode
In Expo Go, shake phone → "Debug Remote JS"
Opens debugger in Chrome

### Tip 3: Test Real Features
Test features only possible on real device:
- 📷 Camera
- 📍 GPS/Location
- 📳 Haptics
- 🔔 Notifications

---

## 🆘 Quick Commands Reference

```bash
# Start with tunnel (recommended for iPhone)
npx expo start --tunnel

# Clear cache and restart
npx expo start --clear --tunnel

# Check your IP
ipconfig

# Start backend
cd backend
node server.js

# Stop Expo
Ctrl + C
```

---

## 📞 Still Need Help?

1. Make sure backend is running
2. Try tunnel mode: `npx expo start --tunnel`
3. Check [FIX_IOS_ERROR.md](FIX_IOS_ERROR.md) for details
4. Verify iPhone and PC on same WiFi
5. Try restarting Expo Go app

---

## 🎯 Quick Start (Copy & Paste)

```bash
# Terminal 1: Start Backend
cd backend
node server.js

# Terminal 2: Start Expo with Tunnel
cd ..
npx expo start --tunnel

# Then scan QR code with iPhone camera!
```

---

**Now scan that QR code and enjoy your app on iPhone! 📱🎉**
