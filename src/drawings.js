// 12 dessins intégrés, tracés au canvas sur une grille 100×100 puis exportés en PNG.
const S = 480;

function bg(c, col) { c.fillStyle = col; c.fillRect(0, 0, 100, 100); }
function circ(c, x, y, r, col) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
function line(c, a, b, d, e) { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.stroke(); }
function star(c, x, y, R, r, col) {
  c.fillStyle = col; c.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  c.closePath(); c.fill();
}

const recipes = [
  // soleil
  (c) => { bg(c, '#FFE08A'); c.strokeStyle = '#FF9F1C'; c.lineWidth = 5; c.lineCap = 'round'; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; line(c, 50 + Math.cos(a) * 26, 50 + Math.sin(a) * 26, 50 + Math.cos(a) * 38, 50 + Math.sin(a) * 38); } circ(c, 50, 50, 19, '#FF9F1C'); circ(c, 43, 47, 2.5, '#7A3E00'); circ(c, 57, 47, 2.5, '#7A3E00'); c.strokeStyle = '#7A3E00'; c.lineWidth = 2.5; c.beginPath(); c.arc(50, 52, 8, .2 * Math.PI, .8 * Math.PI); c.stroke(); },
  // poisson
  (c) => { bg(c, '#9AD7F5'); c.fillStyle = '#FF6F59'; c.beginPath(); c.moveTo(66, 50); c.lineTo(84, 36); c.lineTo(84, 64); c.fill(); c.beginPath(); c.ellipse(46, 50, 25, 16, 0, 0, 7); c.fill(); circ(c, 35, 46, 4, '#fff'); circ(c, 35, 46, 2, '#1D2A3A'); c.fillStyle = '#FFB4A8'; c.beginPath(); c.moveTo(46, 36); c.lineTo(56, 26); c.lineTo(58, 38); c.fill(); circ(c, 24, 24, 3, '#fff'); circ(c, 18, 32, 2, '#fff'); },
  // maison
  (c) => { bg(c, '#CDEBC0'); c.fillStyle = '#4E9F3D'; c.fillRect(0, 80, 100, 20); c.fillStyle = '#FFFFFF'; c.fillRect(28, 48, 44, 32); c.fillStyle = '#E5484D'; c.beginPath(); c.moveTo(20, 50); c.lineTo(50, 22); c.lineTo(80, 50); c.fill(); c.fillStyle = '#7A4B2A'; c.fillRect(45, 60, 11, 20); c.fillStyle = '#8EC5FF'; c.fillRect(32, 56, 9, 9); c.fillRect(60, 56, 9, 9); },
  // étoile
  (c) => { bg(c, '#2C3E70'); star(c, 50, 52, 32, 14, '#FFD23F'); circ(c, 18, 20, 1.8, '#fff'); circ(c, 82, 24, 1.5, '#fff'); circ(c, 80, 82, 1.8, '#fff'); circ(c, 20, 80, 1.4, '#fff'); },
  // cœur
  (c) => { bg(c, '#FFD6E0'); c.fillStyle = '#E63946'; c.beginPath(); c.moveTo(50, 80); c.bezierCurveTo(14, 56, 18, 24, 38, 24); c.bezierCurveTo(46, 24, 50, 30, 50, 36); c.bezierCurveTo(50, 30, 54, 24, 62, 24); c.bezierCurveTo(82, 24, 86, 56, 50, 80); c.fill(); circ(c, 36, 36, 4, 'rgba(255,255,255,.5)'); },
  // lune
  (c) => { bg(c, '#1F2A4D'); circ(c, 48, 50, 24, '#F4E7B0'); circ(c, 60, 42, 21, '#1F2A4D'); circ(c, 76, 24, 2, '#fff'); circ(c, 84, 64, 1.6, '#fff'); circ(c, 24, 20, 1.6, '#fff'); star(c, 72, 78, 6, 2.6, '#FFD23F'); },
  // fleur
  (c) => { bg(c, '#E6F4D7'); c.strokeStyle = '#3A8E4F'; c.lineWidth = 5; line(c, 50, 52, 50, 88); c.fillStyle = '#3A8E4F'; c.beginPath(); c.ellipse(60, 72, 9, 4, -.5, 0, 7); c.fill(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; circ(c, 50 + Math.cos(a) * 14, 40 + Math.sin(a) * 14, 10, '#B983FF'); } circ(c, 50, 40, 9, '#FFD23F'); },
  // chat
  (c) => { bg(c, '#FFE7C2'); c.fillStyle = '#F4A259'; c.beginPath(); c.moveTo(24, 44); c.lineTo(28, 16); c.lineTo(46, 32); c.fill(); c.beginPath(); c.moveTo(76, 44); c.lineTo(72, 16); c.lineTo(54, 32); c.fill(); circ(c, 50, 54, 28, '#F4A259'); circ(c, 40, 50, 4, '#1D2A3A'); circ(c, 60, 50, 4, '#1D2A3A'); c.fillStyle = '#E5484D'; c.beginPath(); c.moveTo(46, 60); c.lineTo(54, 60); c.lineTo(50, 65); c.fill(); c.strokeStyle = '#7A4B2A'; c.lineWidth = 1.6; line(c, 30, 62, 14, 58); line(c, 30, 66, 14, 68); line(c, 70, 62, 86, 58); line(c, 70, 66, 86, 68); },
  // cerises
  (c) => { bg(c, '#FFF1D6'); circ(c, 40, 58, 22, '#D62828'); circ(c, 60, 58, 22, '#D62828'); c.strokeStyle = '#7A4B2A'; c.lineWidth = 4; line(c, 50, 38, 52, 24); c.fillStyle = '#4E9F3D'; c.beginPath(); c.ellipse(62, 26, 10, 5, -.4, 0, 7); c.fill(); circ(c, 36, 50, 4, 'rgba(255,255,255,.55)'); },
  // bateau
  (c) => { bg(c, '#BDE3FF'); c.strokeStyle = '#5A4636'; c.lineWidth = 3; line(c, 50, 16, 50, 66); c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(52, 18); c.lineTo(76, 60); c.lineTo(52, 60); c.fill(); c.fillStyle = '#FF6F59'; c.beginPath(); c.moveTo(48, 26); c.lineTo(30, 60); c.lineTo(48, 60); c.fill(); c.fillStyle = '#8B5A2B'; c.beginPath(); c.moveTo(20, 66); c.lineTo(80, 66); c.lineTo(70, 80); c.lineTo(30, 80); c.fill(); c.fillStyle = '#2F80ED'; c.fillRect(0, 80, 100, 20); },
  // arbre
  (c) => { bg(c, '#DDF3E4'); c.fillStyle = '#7A4B2A'; c.fillRect(45, 56, 10, 30); circ(c, 50, 40, 20, '#2E9E5B'); circ(c, 34, 50, 14, '#2E9E5B'); circ(c, 66, 50, 14, '#2E9E5B'); circ(c, 42, 36, 3, '#E5484D'); circ(c, 60, 46, 3, '#E5484D'); circ(c, 40, 54, 3, '#E5484D'); },
  // ballon
  (c) => { bg(c, '#EAF0FF'); c.strokeStyle = '#5B6B7E'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(50, 66); c.quadraticCurveTo(42, 78, 52, 92); c.stroke(); c.fillStyle = '#8A5CF6'; c.beginPath(); c.ellipse(50, 40, 20, 25, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(46, 64); c.lineTo(54, 64); c.lineTo(50, 69); c.fill(); c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(42, 30, 4, 8, -.4, 0, 7); c.fill(); }
];

let cache = null;

/** URLs (data:image/png) des dessins intégrés, générés une seule fois. */
export function drawings() {
  if (!cache) {
    cache = recipes.map((fn) => {
      const cv = document.createElement('canvas');
      cv.width = cv.height = S;
      const c = cv.getContext('2d');
      c.scale(S / 100, S / 100);
      fn(c);
      return cv.toDataURL('image/png');
    });
  }
  return cache;
}
