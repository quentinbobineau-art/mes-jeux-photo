import { puzzleChoices } from '../pool.js';
import { shuffle } from '../utils.js';
import { sfx } from '../sound.js';

let pzSrc = null;

export default {
  title: 'Puzzle',
  hint: 'Fais glisser une pièce sur une autre pour les échanger.',
  levels: ['4 pièces', '9 pièces', '16 pièces'],
  defaultLevel: 0,
  start(ctx, level) {
    const self = this;
    const n = [2, 3, 4][level], N = n * n;
    const choices = puzzleChoices();
    if (!pzSrc || !choices.includes(pzSrc)) pzSrc = choices[0];

    // Mélange garanti non résolu
    let order;
    do { order = shuffle([...Array(N).keys()]); } while (order.every((v, i) => v === i));
    let sel = null, moves = 0;

    const w = document.createElement('div');
    w.className = 'pz-wrap';

    const top = document.createElement('div');
    top.className = 'pz-top';
    const mini = document.createElement('div');
    mini.className = 'mini';
    mini.setAttribute('role', 'img');
    mini.setAttribute('aria-label', 'Modèle à reconstituer');
    mini.style.backgroundImage = `url('${pzSrc}')`;
    const pick = document.createElement('div');
    pick.className = 'pz-pick';
    pick.setAttribute('role', 'group');
    pick.setAttribute('aria-label', "Choisir l'image du puzzle");
    choices.forEach((s, i) => {
      const btn = document.createElement('button');
      btn.style.backgroundImage = `url('${s}')`;
      btn.setAttribute('aria-label', `Image ${i + 1}`);
      btn.setAttribute('aria-pressed', s === pzSrc);
      btn.onclick = () => { pzSrc = s; self.start(ctx, level); };
      pick.appendChild(btn);
    });
    top.append(mini, pick);

    const b = document.createElement('div');
    b.className = 'pz-board';
    b.style.gridTemplateColumns = `repeat(${n},1fr)`;
    w.append(top, b);
    ctx.stage.replaceChildren(w);
    pick.querySelector('[aria-pressed="true"]')?.scrollIntoView({ inline: 'nearest', block: 'nearest' });

    const status = () => ctx.setStatus(`<span class="counter">${moves} échange${moves > 1 ? 's' : ''}</span>`);

    function swap(a, c) {
      [order[a], order[c]] = [order[c], order[a]];
      moves++;
      sfx.good();
      status();
      draw();
      if (order.every((v, i) => v === i)) {
        b.classList.add('solved');
        ctx.later(() => ctx.win(`Puzzle terminé en ${moves} échange${moves > 1 ? 's' : ''}.`), 700);
      }
    }

    function draw() {
      b.replaceChildren();
      order.forEach((k, pos) => {
        const p = document.createElement('button');
        p.className = 'piece' + (sel === pos ? ' sel' : '');
        p.setAttribute('aria-label', `Pièce ${pos + 1}`);
        p.style.backgroundImage = `url('${pzSrc}')`;
        p.style.backgroundSize = `${n * 100}% ${n * 100}%`;
        p.style.backgroundPosition = `${((k % n) * 100) / (n - 1)}% ${(Math.floor(k / n) * 100) / (n - 1)}%`;
        p.dataset.pos = pos;
        p.addEventListener('pointerdown', (e) => onDown(e, p, pos));
        // Clavier : Entrée/Espace = sélection puis échange
        p.addEventListener('keydown', (e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          tap(pos);
          b.querySelector(`[data-pos="${pos}"]`)?.focus();
        });
        b.appendChild(p);
      });
    }

    // Échange par deux touchers (secours)
    function tap(pos) {
      if (b.classList.contains('solved')) return;
      if (sel === null) { sel = pos; sfx.flip(); draw(); }
      else if (sel === pos) { sel = null; draw(); }
      else { const s = sel; sel = null; swap(s, pos); }
    }

    function onDown(e, p, pos) {
      if (b.classList.contains('solved') || e.button > 0) return;
      e.preventDefault();
      const r = p.getBoundingClientRect(), g = document.createElement('div');
      g.className = 'ghost';
      Object.assign(g.style, {
        width: r.width + 'px', height: r.height + 'px', left: r.left + 'px', top: r.top + 'px',
        backgroundImage: p.style.backgroundImage, backgroundSize: p.style.backgroundSize, backgroundPosition: p.style.backgroundPosition
      });
      const d = { x: e.clientX, y: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, moved: false, over: null };

      const move = (ev) => {
        const mx = ev.clientX, my = ev.clientY;
        if (!d.moved && Math.hypot(mx - d.x, my - d.y) > 8) {
          d.moved = true;
          document.body.appendChild(g);
          p.classList.add('lift');
          sel = null;
          b.querySelectorAll('.sel').forEach((x) => x.classList.remove('sel'));
          sfx.flip();
        }
        if (!d.moved) return;
        g.style.left = mx - d.dx + 'px';
        g.style.top = my - d.dy + 'px';
        const hit = document.elementFromPoint(mx, my), t = hit && hit.closest('.piece');
        const ok = t && t !== p && b.contains(t) ? t : null;
        if (ok !== d.over) {
          d.over?.classList.remove('over');
          ok?.classList.add('over');
          d.over = ok;
        }
      };
      const end = (ev) => {
        removeEventListener('pointermove', move);
        removeEventListener('pointerup', end);
        removeEventListener('pointercancel', end);
        g.remove();
        p.classList.remove('lift');
        d.over?.classList.remove('over');
        if (!ctx.alive()) return;
        if (d.moved) {
          if (d.over && ev.type === 'pointerup') swap(pos, +d.over.dataset.pos);
          else draw();
        } else if (ev.type === 'pointerup') tap(pos);
      };
      addEventListener('pointermove', move);
      addEventListener('pointerup', end);
      addEventListener('pointercancel', end);
    }

    status();
    draw();
    ctx.fit(b, n, n);
  }
};
