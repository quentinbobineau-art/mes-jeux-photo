import '@fontsource/fredoka/latin-500.css';
import '@fontsource/fredoka/latin-600.css';
import '@fontsource/fredoka/latin-700.css';
import '@fontsource/nunito/latin-500.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-800.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/games.css';

import { $ } from './utils.js';
import { photos, loadPhotos, onPhotosChange } from './photos.js';
import { pool } from './pool.js';
import { sfx, isSoundOn, setSound } from './sound.js';
import { confetti } from './confetti.js';
import { initParent } from './parent.js';
import memory from './games/memory.js';
import lynx from './games/lynx.js';
import puzzle from './games/puzzle.js';

const GAMES = { memory, lynx, puzzle };
let current = null, level = 0, gen = 0, lastFit = null;

/* ---------- Accueil ---------- */
function renderHome() {
  const imgs = pool(4);
  const mem = $('#pvMem');
  mem.innerHTML = '<div></div><div></div><div></div><div></div>';
  const f = document.createElement('img');
  f.src = imgs[0]; f.alt = '';
  mem.children[3].appendChild(f);
  $('#pvLyn').innerHTML = `<div class="tg"><img alt="" src="${imgs[1]}"></div>`;
  const pz = photos[0] ? photos[0].full : imgs[2];
  $('#pvPuz').innerHTML = [3, 0, 2, 1]
    .map((k) => `<div style="background-image:url('${pz}');background-position:${(k % 2) * 100}% ${Math.floor(k / 2) * 100}%"></div>`)
    .join('');
  const n = photos.length;
  $('#homeHint').textContent = n === 0
    ? 'Les jeux utilisent les dessins intégrés. Ajoutez vos photos depuis l’espace parent.'
    : `${n} photo${n > 1 ? 's' : ''} dans les jeux.`;
}

/* ---------- Son ---------- */
const soundBtn = $('#soundBtn');
function renderSound() {
  soundBtn.setAttribute('aria-pressed', isSoundOn());
  soundBtn.setAttribute('aria-label', isSoundOn() ? 'Son activé' : 'Son coupé');
}
soundBtn.onclick = () => { setSound(!isSoundOn()); renderSound(); if (isSoundOn()) sfx.flip(); };
renderSound();

/* ---------- Contexte de partie ---------- */
const stage = $('#stage');

// Ajuste la largeur du plateau pour qu'il tienne en hauteur dans l'écran.
function fit(board, cols, rows) {
  lastFit = { board, cols, rows };
  board.style.maxWidth = '';
  const cs = getComputedStyle(board);
  const gap = parseFloat(cs.rowGap) || 0;
  const padY = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
  const padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
  const bottomPad = parseFloat(getComputedStyle($('.app')).paddingBottom) || 24;
  const avail = innerHeight - board.getBoundingClientRect().top - bottomPad;
  const cell = (avail - padY - gap * (rows - 1)) / rows;
  const w = cell * cols + gap * (cols - 1) + padX;
  board.style.maxWidth = `${Math.max(220, Math.floor(w))}px`;
}
addEventListener('resize', () => {
  if (lastFit && lastFit.board.isConnected && !$('#game').hidden) fit(lastFit.board, lastFit.cols, lastFit.rows);
});

function makeCtx() {
  const my = ++gen;
  const alive = () => my === gen && current !== null;
  return {
    stage,
    alive,
    later: (fn, ms) => setTimeout(() => { if (alive()) fn(); }, ms),
    setStatus: (html) => { $('#gStatus').innerHTML = html; },
    fit,
    win
  };
}

function start() {
  GAMES[current].start(makeCtx(), level);
}

function win(msg) {
  sfx.win();
  confetti();
  const w = document.createElement('div');
  w.className = 'win';
  w.setAttribute('role', 'dialog');
  w.setAttribute('aria-modal', 'true');
  w.setAttribute('aria-label', 'Bravo');
  w.innerHTML = `<div class="box"><h3>Bravo&nbsp;!</h3><p></p><div class="btns"><button class="btn" data-a="again">Rejouer</button><button class="btn alt" data-a="menu">Menu</button></div></div>`;
  w.querySelector('p').textContent = msg;
  w.querySelector('[data-a=again]').onclick = start;
  w.querySelector('[data-a=menu]').onclick = home;
  stage.appendChild(w);
  w.querySelector('.btn').focus();
}

/* ---------- Navigation ---------- */
function renderLevels() {
  const L = $('#levels');
  L.replaceChildren();
  GAMES[current].levels.forEach((t, i) => {
    const b = document.createElement('button');
    b.textContent = t;
    b.setAttribute('aria-pressed', i === level);
    b.onclick = () => { level = i; renderLevels(); start(); };
    L.appendChild(b);
  });
}

function open(name) {
  current = name;
  level = GAMES[name].defaultLevel;
  $('#home').hidden = true;
  $('#game').hidden = false;
  document.documentElement.classList.add('playing');
  scrollTo(0, 0);
  $('#gTitle').textContent = GAMES[name].title;
  $('#gHint').textContent = GAMES[name].hint;
  renderLevels();
  start();
  history.pushState({ game: name }, '');
}

function teardown() {
  current = null;
  gen++;
  lastFit = null;
  stage.replaceChildren();
  $('#game').hidden = true;
  $('#home').hidden = false;
  document.documentElement.classList.remove('playing');
  renderHome();
}

// « Menu » revient dans l'historique : le geste retour (Android) et le bouton passent par le même chemin.
function home() {
  if (current === null) return;
  if (history.state?.game) history.back();
  else teardown();
}
addEventListener('popstate', () => { if (current !== null) teardown(); });

document.querySelectorAll('.tile').forEach((t) => (t.onclick = () => open(t.dataset.game)));
$('#backBtn').onclick = home;
$('#againBtn').onclick = () => start();

/* ---------- Gestes ---------- */
// Bloque le pinch-zoom résiduel de Safari iOS.
['gesturestart', 'gesturechange'].forEach((t) => document.addEventListener(t, (e) => e.preventDefault(), { passive: false }));
// Pas de menu contextuel sur appui long (images, boutons).
document.addEventListener('contextmenu', (e) => { if (!e.target.closest('input, textarea')) e.preventDefault(); });

/* ---------- Démarrage ---------- */
initParent({ onClose: renderHome });
onPhotosChange(() => { if (current === null) renderHome(); });
renderHome();
loadPhotos();
