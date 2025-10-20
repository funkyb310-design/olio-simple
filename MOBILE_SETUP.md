 📱 Mobile Testing Setup Guide

## Problem: "Network Failed" on Mobile Device

When testing on a physical device or Expo Go app, your mobile can't access `localhost` because it's on a different network than your PC.

## ✅ Solution: Use Your PC's IP Address

### **Step 1: Find Your PC's IP Address**

#### On Windows:
```powershell
ipconfig
```

Look for **"Wireless LAN adapter Wi-Fi"** section:
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.1.100
```

#### On Mac/Linux:
```bash
ifconfig | grep "inet "
```

### **Step 2: Update Configuration Files**

**Replace `192.168.1.100` with YOUR actual IP address in these files:**

#### 1. `src/services/api.js` (Line 5):
```javascript
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:3000/api'
  : 'http://192.168.1.100:3000/api'; // ⬅️ Change this IP
```

#### 2. `App.js` (Line 33):
```javascript
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:3000/api'
  : 'http://192.168.1.100:3000/api'; // ⬅️ Change this IP
```

### **Step 3: Ensure Backend is Running**

Your backend server should show:
```
Server running on http://0.0.0.0:3000
✅ Successfully connected to MongoDB Atlas!
```

**Note:** Make sure it says `0.0.0.0` NOT `localhost` - this allows external connections.

### **Step 4: Check Firewall**

**Windows Firewall** might block connections. Allow Node.js:

1. Open **Windows Defender Firewall**
2. Click **"Allow an app through firewall"**
3. Find **Node.js** and check both Private & Public
4. Click **OK**

Or run this PowerShell command (as Administrator):
```powershell
New-NetFirewallRule -DisplayName "Node.js Server" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

### **Step 5: Ensure Same WiFi Network**

**Both your PC and mobile MUST be on the same WiFi network!**

❌ PC on WiFi, Phone on Mobile Data = Won't work  
✅ PC on WiFi, Phone on same WiFi = Works

### **Step 6: Restart Everything**

```powershell
# Stop backend (Ctrl+C)
# Stop frontend (Ctrl+C)

# Restart backend
cd backend
node server.js

# Open new terminal, restart frontend
npm start
```

### **Step 7: Test Connection**

On your mobile browser, visit:
```
http://YOUR_PC_IP:3000/api/test
```

Example:
```
http://192.168.1.100:3000/api/test
```

You should see:
```json
{"message":"Server is running!"}
```

✅ If you see this = Connection works!  
❌ If timeout/error = Check firewall or WiFi

---

## 🔧 Quick Test Commands

### Test from mobile browser:
```
http://192.168.1.100:3000/api/test
```

### Test backend from PC:
```powershell
curl http://localhost:3000/api/test
```

---

## 📋 Common Issues & Fixes

### Issue 1: "Network request failed"
**Cause:** Wrong IP address or firewall blocking  
**Fix:** Double-check IP with `ipconfig` and disable firewall temporarily

### Issue 2: "Connection refused"
**Cause:** Backend not running or running on wrong port  
**Fix:** Restart backend, ensure it shows `0.0.0.0:3000`

### Issue 3: "Timeout"
**Cause:** Different WiFi networks  
**Fix:** Connect both devices to same WiFi

### Issue 4: Backend says "127.0.0.1" or "localhost"
**Cause:** Backend only listening on localhost  
**Fix:** Change `app.listen(3000)` to `app.listen(3000, '0.0.0.0')`

---

## ✅ Your Current Backend Configuration

Your `backend/server.js` already has the correct setup:
```javascript
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://172.20.10.11:${PORT}`);
});
```

The `0.0.0.0` means it accepts connections from any network interface!

---

## 🎯 Final Checklist

- [ ] Found PC's IP address using `ipconfig`
- [ ] Updated IP in `src/services/api.js`
- [ ] Updated IP in `App.js`
- [ ] Backend running with `0.0.0.0`
- [ ] Mobile and PC on same WiFi
- [ ] Firewall allows Node.js
- [ ] Can access `http://YOUR_IP:3000/api/test` from mobile browser
- [ ] Restarted both backend and frontend

---

## 📱 Testing Flow

1. **On PC:** Start backend (`node backend/server.js`)
2. **On PC:** Start frontend (`npm start`)
3. **On Mobile:** Scan QR code with Expo Go
4. **On Mobile:** Register/Login
5. **On Mobile:** Try adding a listing

If registration works = Backend connection successful! 🎉
