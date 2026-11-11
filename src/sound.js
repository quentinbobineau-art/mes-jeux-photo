// Sons synthétisés en WebAudio : aucun fichier, aucun réseau.
const KEY = 'mjp-sound';
let enabled = true;
try { enabled = localStorage.getItem(KEY) !== 'off'; } catch { /* stockage indisponible */ }
let ac = null;

export const isSoundOn = () => enabled;
export function setSound(on) {
  enabled = on;
  try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* ignore */ }
}

function tone(f, d = 0.12, t = 0, type = 'sine') {
  if (!enabled) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    const o = ac.createOscillator(), g = ac.createGain(), s = ac.currentTime + t;
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, s);
    g.gain.exponentialRampToValueAtTime(0.2, s + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, s + d);
    o.connect(g).connect(ac.destination);
    o.start(s); o.stop(s + d + 0.02);
  } catch { /* audio indisponible */ }
}

export const sfx = {
  flip: () => tone(520, 0.07, 0, 'triangle'),
  good: () => { tone(660, 0.12); tone(880, 0.16, 0.1); },
  bad: () => tone(220, 0.15, 0, 'square'),
  win: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.2, i * 0.12))
};
