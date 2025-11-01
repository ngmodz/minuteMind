# App Icons

This folder contains the app icons for the MinuteMind PWA.

## Required Icons

You need to create PNG images in the following sizes:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## How to Generate Icons

### Method 1: Use the Icon Generator (Easiest)
1. Open `../generate-icons.html` in your browser
2. Upload your logo image (the clock+book icon)
3. Click "Generate All Icons"
4. Download all icons and place them in this folder

### Method 2: Use Online Tools
- https://www.pwabuilder.com/imageGenerator
- https://realfavicongenerator.net/
- Upload your logo and download the generated icons

### Method 3: Use Placeholder Icons
1. Open `../create-placeholder-icons.html` in your browser
2. It will generate basic placeholder icons
3. Replace them with your actual logo later

## Your Logo
The logo should be:
- A clock icon with a book (as provided)
- Square format (1:1 aspect ratio)
- High resolution (at least 512x512px)
- PNG format with transparent or white background
- Simple and recognizable at small sizes

## Testing
After adding icons, test them by:
1. Opening the app in Chrome
2. Press F12 → Application tab → Manifest
3. Check if all icons are loading correctly
