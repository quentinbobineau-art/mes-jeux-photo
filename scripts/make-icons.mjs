// Génère les icônes PNG de la PWA à partir de SVG inline. Lancer : npm run icons
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const tiles = (pad, gap, r) => {
  const s = (512 - pad * 2 - gap) / 2;
  const cols = ['#FF6F59', '#FFC93C', '#2F80ED', '#2FA36B'];
  return cols.map((c, i) => {
    const x = pad + (i % 2) * (s + gap), y = pad + Math.floor(i / 2) * (s + gap);
    return `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${r}" fill="${c}"/>`;
  }).join('');
};
const svg = (rx, pad, gap, r) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="${rx}" fill="#FFFFFF"/>${tiles(pad, gap, r)}</svg>`;

const any = svg(0, 72, 28, 44);            // iOS et Android arrondissent eux-mêmes
const maskable = svg(0, 132, 22, 34);      // contenu dans la zone sûre (80 %)
const favicon = svg(110, 72, 28, 44);

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/favicon.svg', favicon);
const out = [
  [any, 192, 'icon-192.png'],
  [any, 512, 'icon-512.png'],
  [maskable, 512, 'icon-maskable-512.png'],
  [any, 180, 'apple-touch-icon.png']
];
for (const [s, size, name] of out) {
  await sharp(Buffer.from(s)).resize(size, size).png().toFile(`public/icons/${name}`);
  console.log('✓', name);
}
