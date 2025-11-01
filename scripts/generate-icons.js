// Icon Generator Script for MinuteMind PWA
// This script helps generate all required icon sizes from a source image

console.log('📱 MinuteMind Icon Generator\n');
console.log('To generate icons, you have several options:\n');

console.log('1. Use the web-based generator:');
console.log('   - Open generate-icons.html in your browser');
console.log('   - Upload your logo image');
console.log('   - Download all generated icons\n');

console.log('2. Use online tools:');
console.log('   - PWA Builder: https://www.pwabuilder.com/imageGenerator');
console.log('   - Favicon Generator: https://realfavicongenerator.net/\n');

console.log('3. Use command-line tools (requires installation):');
console.log('   npm install -g pwa-asset-generator');
console.log('   pwa-asset-generator logo.png icons/ --icon-only\n');

console.log('4. Use ImageMagick (if installed):');
console.log('   convert logo.png -resize 72x72 icons/icon-72x72.png');
console.log('   convert logo.png -resize 96x96 icons/icon-96x96.png');
console.log('   convert logo.png -resize 128x128 icons/icon-128x128.png');
console.log('   convert logo.png -resize 144x144 icons/icon-144x144.png');
console.log('   convert logo.png -resize 152x152 icons/icon-152x152.png');
console.log('   convert logo.png -resize 192x192 icons/icon-192x192.png');
console.log('   convert logo.png -resize 384x384 icons/icon-384x384.png');
console.log('   convert logo.png -resize 512x512 icons/icon-512x512.png\n');

console.log('Required icon sizes:');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
sizes.forEach(size => {
    console.log(`   - icon-${size}x${size}.png`);
});

console.log('\n✨ After generating icons, place them in the /icons folder');
console.log('🚀 Then deploy your app and it will be installable as a PWA!\n');
