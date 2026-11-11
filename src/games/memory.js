import { pool } from '../pool.js';
import { shuffle } from '../utils.js';
import { sfx } from '../sound.js';

export default {
  title: 'Memory',
  hint: 'Retourne deux cartes. Si elles sont pareilles, tu gardes la paire.',
  levels: ['3 paires', '6 paires', '8 paires'],
  defaultLevel: 1,
  start(ctx, level) {
    const pairs = [3, 6, 8][level], cols = pairs === 3 ? 3 : 4, imgs = pool(pairs);
    const deck = shuffle([...imgs, ...imgs].map((src, i) => ({ id: i % pairs, src })));
    let opened = [], lock = false, moves = 0, found = 0;

    const b = document.createElement('div');
    b.className = 'board';
    b.style.gridTemplateColumns = `repeat(${cols},1fr)`;
    ctx.stage.replaceChildren(b);

    const status = () => ctx.setStatus(`<span class="counter">${found}/${pairs} paires · ${moves} coups</span>`);
    status();

    for (const card of deck) {
      const el = document.createElement('button');
      el.className = 'mcard';
      el.setAttribute('aria-label', 'Carte cachée');
      el.innerHTML = '<div class="inner"><div class="face back"></div><div class="face front"></div></div>';
      el.querySelector('.front').style.backgroundImage = `url('${card.src}')`;
      el.onclick = () => {
        if (lock || el.classList.contains('open') || el.classList.contains('done')) return;
        el.classList.add('open');
        sfx.flip();
        opened.push({ el, card });
        if (opened.length === 2) {
          moves++;
          const [a, c] = opened;
          opened = [];
          if (a.card.id === c.card.id) {
            ctx.later(() => {
              for (const o of [a, c]) {
                o.el.classList.remove('open');
                o.el.classList.add('done');
                o.el.setAttribute('aria-label', 'Paire trouvée');
              }
              sfx.good();
              found++;
              status();
              if (found === pairs) ctx.later(() => ctx.win(`Toutes les paires en ${moves} coups.`), 450);
            }, 300);
          } else {
            lock = true;
            ctx.later(() => { a.el.classList.remove('open'); c.el.classList.remove('open'); lock = false; }, 950);
          }
        }
        status();
      };
      b.appendChild(el);
    }
    ctx.fit(b, cols, deck.length / cols);
  }
};
