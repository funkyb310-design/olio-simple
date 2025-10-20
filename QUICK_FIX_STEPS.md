# Quick Fix for Message Error

The code has been updated but your app might be using cached code. Follow these steps:

## Step 1: Stop Everything

1. **Stop the Expo app** (press Ctrl+C in the terminal running `npm start`)
2. **Stop the backend** (press Ctrl+C in the backend terminal)

## Step 2: Clear Cache & Restart Backend

```bash
# In backend folder
cd backend
npm start
```

Wait until you see: ✅ Successfully connected to MongoDB Atlas!

## Step 3: Clear Expo Cache & Restart

In a NEW terminal (keep backend running):

```bash
# Clear cache and restart
npx expo start -c
```

Or if using npm:

```bash
npm start -- -c
```

The `-c` flag clears the cache completely.

## Step 4: Reload App on Phone

Once Expo starts:
1. **Shake your phone** OR
2. **Press 'r' in the terminal** to reload
3. The error should be gone!

## If Error Persists

The issue might be that you have an old version cached. Try this:

### On Your Phone:
1. Open the Expo Go app
2. Shake your phone to open developer menu
3. Tap "Reload"
4. If still failing, tap "Clear cache and reload"

### Alternative - Full Restart:
1. Close Expo Go app completely (swipe away)
2. Stop the terminal (Ctrl+C)
3. Run: `npx expo start -c`
4. Reopen Expo Go and scan QR code again

## Step 5: Test the Feature

After reloading:
1. Login to your account
2. Click on a food item
3. Click "Send a message"
4. You should see the chat screen!
5. Type a message and send

## If You Still See the Error

The error mentions "Property 'api' doesn't exist" - this means old code is still running.

Check that:
- Backend is running on http://172.20.10.11:3000
- You're connected to the same WiFi network
- The App.js file was saved properly

Try this nuclear option:
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
npx expo start -c
```

## Common Issues

**"Cannot connect to backend"**
- Make sure backend is running
- Check your IP address hasn't changed
- Both phone and computer must be on same WiFi

**"ChatScreen not found"**
- Make sure ChatScreen.js exists in src/screens/
- Check the import statement in App.js

**Messages screen shows "No messages yet"**
- This is CORRECT if you haven't sent any messages yet
- Try sending a message from item detail first
