// Generates the source images for `npx capacitor-assets generate` (app icon + splash)
// from the DiabetMed brand mark (white drop on the teal gradient).
// Usage: node scripts/make-app-assets.cjs && npx capacitor-assets generate --android
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const out = path.join(__dirname, '..', 'assets');
fs.mkdirSync(out, { recursive: true });

const gradient = (id) => `
  <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#0891B2"/>
    <stop offset="1" stop-color="#0B4F63"/>
  </linearGradient>`;

// Drop + small pulse line, drawn in a 1024 box, centred around (512, 512)
const mark = (scale = 1, color = '#FFFFFF') => `
  <g transform="translate(512 512) scale(${scale}) translate(-512 -512)">
    <path d="M512 232 C512 232 318 470 318 600 a194 194 0 0 0 388 0 C706 470 512 232 512 232Z" fill="${color}"/>
    <path d="M410 610 h52 l26 -58 l40 116 l30 -78 h56" fill="none" stroke="#0E7490" stroke-width="30"
          stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;

const svg = (body, defs = '') => Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><defs>${defs}</defs>${body}</svg>`
);

const splash = (dark) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732" viewBox="0 0 2732 2732">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${dark ? '#0B3B4A' : '#0E7490'}"/>
    <stop offset="1" stop-color="${dark ? '#0B1220' : '#0B4F63'}"/>
  </linearGradient></defs>
  <rect width="2732" height="2732" fill="url(#g)"/>
  <g transform="translate(1366 1366) scale(0.9) translate(-512 -512)">
    <rect x="212" y="212" width="600" height="600" rx="150" fill="#FFFFFF" fill-opacity="0.14"/>
    ${mark(0.55)}
  </g>
</svg>`);

(async () => {
  // Full icon (legacy / iOS)
  await sharp(svg(`<rect width="1024" height="1024" rx="0" fill="url(#bg)"/>${mark(0.95)}`, gradient('bg'))).png().toFile(path.join(out, 'icon-only.png'));
  // Adaptive icon layers (Android): foreground kept inside the 66% safe zone
  await sharp(svg(mark(0.62))).png().toFile(path.join(out, 'icon-foreground.png'));
  await sharp(svg(`<rect width="1024" height="1024" fill="url(#bg)"/>`, gradient('bg'))).png().toFile(path.join(out, 'icon-background.png'));
  await sharp(splash(false)).png().toFile(path.join(out, 'splash.png'));
  await sharp(splash(true)).png().toFile(path.join(out, 'splash-dark.png'));
  console.log('assets written to', out);
})();
