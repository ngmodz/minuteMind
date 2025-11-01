# PWA Setup Guide for MinuteMind

Your app is now configured as a Progressive Web App (PWA) and can be installed on both PC and mobile devices!

## 📱 What's Been Added

1. **manifest.json** - PWA configuration file
2. **service-worker.js** - Enables offline functionality and caching
3. **Icons folder** - For app icons in various sizes
4. **Install prompt** - Automatic installation banner
5. **Offline support** - App works without internet

## 🎨 Setting Up Your Logo

### Option 1: Use the Icon Generator (Recommended)
1. Open `generate-icons.html` in your browser
2. Drag and drop your logo image (the clock+book icon you provided)
3. Click "Generate All Icons"
4. Click "Download All Icons"
5. Move all downloaded icons to the `/icons` folder

### Option 2: Use the Placeholder Generator
1. Open `create-placeholder-icons.html` in your browser
2. It will automatically download placeholder icons
3. Move them to the `/icons` folder
4. Replace with your actual logo later

### Option 3: Manual Creation
Create PNG images in these sizes and save them in the `/icons` folder:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## 📲 How to Install

### On Mobile (Android)
1. Open the app in Chrome
2. Tap the menu (⋮) → "Install app" or "Add to Home Screen"
3. The app icon will appear on your home screen

### On Mobile (iOS)
1. Open the app in Safari
2. Tap the Share button (□↑)
3. Scroll and tap "Add to Home Screen"
4. Tap "Add"

### On Desktop (Chrome/Edge)
1. Open the app in Chrome or Edge
2. Look for the install icon (⊕) in the address bar
3. Click it and select "Install"
4. Or use the automatic install banner that appears

### On Desktop (Other Browsers)
- The install banner will appear automatically
- Click "Install" when prompted

## ✨ PWA Features

### Offline Support
- App works without internet connection
- Cached pages and resources load instantly
- Study data syncs when connection returns

### App-like Experience
- Runs in standalone window (no browser UI)
- Fast loading with service worker caching
- Smooth animations and transitions

### Home Screen Icon
- Custom app icon on home screen
- Looks like a native app
- Quick access from device

### Shortcuts
- Long-press app icon for quick actions:
  - Log Study Time
  - View Analytics

## 🔧 Testing Your PWA

### Check PWA Status
1. Open Chrome DevTools (F12)
2. Go to "Application" tab
3. Check "Manifest" section
4. Check "Service Workers" section

### Test Installation
1. Open the app in a browser
2. Wait for the install banner
3. Click "Install" to test

### Test Offline Mode
1. Open Chrome DevTools
2. Go to "Network" tab
3. Check "Offline" checkbox
4. Reload the page - it should still work!

## 🚀 Deployment Notes

### For Vercel/Netlify
- All files are ready to deploy
- Make sure `/icons` folder is included
- Service worker will register automatically

### HTTPS Required
- PWAs require HTTPS (except localhost)
- Vercel/Netlify provide HTTPS automatically

### Update the Service Worker
When you make changes:
1. Update the `CACHE_NAME` in `service-worker.js` (e.g., 'minutemind-v2')
2. Users will be prompted to reload for updates

## 📊 PWA Checklist

- ✅ manifest.json configured
- ✅ Service worker registered
- ✅ Icons in multiple sizes
- ✅ Offline page created
- ✅ Install prompt added
- ✅ HTTPS ready
- ✅ Mobile responsive
- ✅ iOS support added

## 🎯 Next Steps

1. Generate your app icons using `generate-icons.html`
2. Test the installation on your device
3. Deploy to Vercel/Netlify
4. Share the link and let users install!

## 🐛 Troubleshooting

### Install button doesn't appear
- Make sure you're using HTTPS (or localhost)
- Check if already installed
- Try in incognito mode

### Icons not showing
- Verify icons exist in `/icons` folder
- Check file names match manifest.json
- Clear cache and reload

### Service worker not registering
- Check browser console for errors
- Verify service-worker.js is accessible
- Make sure you're on HTTPS

## 📱 Browser Support

- ✅ Chrome (Android & Desktop)
- ✅ Edge (Desktop)
- ✅ Safari (iOS) - Limited PWA features
- ✅ Firefox (Android)
- ✅ Samsung Internet

Enjoy your installable MinuteMind app! 🎉
