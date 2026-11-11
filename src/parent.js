// Espace parent : gestion des photos et « À propos », derrière un appui long de 2 s.
import { $ } from './utils.js';
import { photos, addFiles, removePhoto, removeAll, onPhotosChange, storageInfo } from './photos.js';

const HOLD_MS = 2000;

export function initParent({ onClose }) {
  const btn = $('#parentBtn');
  const dlg = $('#parent');
  const help = $('#holdHelp');
  let timer = null;

  const startHold = () => {
    if (timer) return;
    btn.classList.add('holding');
    timer = setTimeout(() => { cancelHold(); openSheet(); }, HOLD_MS);
  };
  const cancelHold = () => {
    clearTimeout(timer);
    timer = null;
    btn.classList.remove('holding');
  };

  btn.addEventListener('pointerdown', (e) => { if (e.button > 0) return; e.preventDefault(); startHold(); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((t) => btn.addEventListener(t, cancelHold));
  btn.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); startHold(); } });
  btn.addEventListener('keyup', (e) => { if (e.key === 'Enter' || e.key === ' ') cancelHold(); });
  // Un toucher bref ne fait rien, sauf rappeler la consigne au parent.
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    help.animate?.([{ color: 'var(--coral)' }, { color: 'var(--muted)' }], { duration: 1200 });
  });

  function openSheet() {
    renderPhotos();
    renderStorage();
    dlg.showModal();
    $('#parentClose').focus();
  }
  $('#parentClose').onclick = () => dlg.close();
  dlg.addEventListener('close', () => onClose?.());

  $('#clearBtn').onclick = async () => {
    if (!confirm(`Retirer les ${photos.length} photos de l’application ? Elles restent dans la photothèque du téléphone.`)) return;
    await removeAll();
  };

  onPhotosChange(() => { if (dlg.open) { renderPhotos(); renderStorage(); } });

  function renderPhotos(progress) {
    const s = $('#strip');
    s.replaceChildren();
    photos.forEach((p, i) => {
      const d = document.createElement('div');
      d.className = 'thumb';
      d.innerHTML = `<img alt="Photo ${i + 1}"><button aria-label="Retirer la photo ${i + 1}">×</button>`;
      d.querySelector('img').src = p.full;
      d.querySelector('button').onclick = () => removePhoto(p.id);
      s.appendChild(d);
    });
    const add = document.createElement('label');
    add.className = 'add' + (progress ? ' busy' : '');
    add.innerHTML = '<div><span>+</span>Ajouter</div><input type="file" accept="image/*" multiple>';
    s.appendChild(add);
    add.querySelector('input').onchange = async (e) => {
      const files = [...e.target.files];
      e.target.value = '';
      if (!files.length) return;
      add.classList.add('busy');
      const { failed } = await addFiles(files, (i, n) => { $('#photoHint').textContent = `Préparation des photos… ${i}/${n}`; });
      renderPhotos();
      if (failed) $('#photoHint').textContent += ` ${failed} photo${failed > 1 ? 's n’ont' : ' n’a'} pas pu être ajoutée${failed > 1 ? 's' : ''}.`;
    };

    $('#clearBtn').hidden = !photos.length;
    const n = photos.length;
    $('#photoHint').textContent = n === 0
      ? 'Ajoutez une ou plusieurs photos depuis la photothèque. Sans photo, les jeux utilisent les dessins intégrés.'
      : n < 6
        ? `${n} photo${n > 1 ? 's' : ''}. Les jeux complètent avec des zooms de vos photos, puis des dessins.`
        : `${n} photos. Tous les jeux utilisent vos images.`;
  }

  async function renderStorage() {
    const { persisted, usage } = await storageInfo();
    const mo = usage != null ? ` · ${(usage / 1048576).toFixed(1)} Mo utilisés` : '';
    $('#storageInfo').textContent = `Stockage protégé : ${persisted ? 'oui' : 'non'}${mo}`;
  }
}
