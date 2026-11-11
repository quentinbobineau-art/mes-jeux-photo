import { prefersReducedMotion } from './utils.js';

const COLORS = ['#FFC93C', '#FF6F59', '#2F80ED', '#2FA36B', '#8A5CF6'];

export function confetti() {
  if (prefersReducedMotion()) return;
  const cv = document.getElementById('confetti');
  const c = cv.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = innerWidth, H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const ps = Array.from({ length: 140 }, () => ({
    x: W / 2, y: H * 0.45,
    vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4,
    r: Math.random() * 6 + 4, c: COLORS[(Math.random() * 5) | 0], a: Math.random() * 6
  }));
  let t = 0;
  (function step() {
    c.clearRect(0, 0, W, H);
    for (const p of ps) {
      p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.a += 0.2;
      c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.fillStyle = p.c; c.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); c.restore();
    }
    if (++t < 110) requestAnimationFrame(step); else c.clearRect(0, 0, W, H);
  })();
}
