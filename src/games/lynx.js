import { pool } from '../pool.js';
import { shuffle } from '../utils.js';
import { sfx } from '../sound.js';

const ROUNDS = 5;

export default {
  title: 'Lynx',
  hint: "Regarde l'image dans le cadre et touche la même sur le plateau.",
  levels: ['6 images', '9 images', '12 images'],
  defaultLevel: 0,
  start(ctx, level) {
    const size = [6, 9, 12][level], cols = size === 12 ? 4 : 3;
    let round = 0;

    const status = () => ctx.setStatus(
      `<div class="stars" role="img" aria-label="${round} sur ${ROUNDS}">${Array.from({ length: ROUNDS }, (_, i) => `<i class="${i < round ? 'on' : ''}"></i>`).join('')}</div>`
    );

    function next() {
      status();
      const imgs = pool(size), ti = (Math.random() * size) | 0;

      const t = document.createElement('div');
      t.className = 'target';
      t.innerHTML = '<div class="frame" role="img" aria-label="Image à retrouver"></div><p>Où est cette image ?</p>';
      t.querySelector('.frame').style.backgroundImage = `url('${imgs[ti]}')`;

      const b = document.createElement('div');
      b.className = 'board';
      b.style.gridTemplateColumns = `repeat(${cols},1fr)`;
      b.style.marginTop = '14px';
      ctx.stage.replaceChildren(t, b);

      let done = false;
      for (const o of shuffle(imgs.map((s, i) => ({ s, i })))) {
        const c = document.createElement('button');
        c.className = 'lcell';
        c.setAttribute('aria-label', 'Image');
        c.style.backgroundImage = `url('${o.s}')`;
        c.onclick = () => {
          if (done) return;
          if (o.i === ti) {
            done = true;
            c.classList.add('good');
            sfx.good();
            round++;
            status();
            ctx.later(() => (round >= ROUNDS ? ctx.win('Tu as trouvé les 5 images. Œil de lynx\u00A0!') : next()), 800);
          } else {
            c.classList.remove('bad');
            void c.offsetWidth;
            c.classList.add('bad');
            sfx.bad();
          }
        };
        b.appendChild(c);
      }
      ctx.fit(b, cols, size / cols);
    }
    next();
  }
};
