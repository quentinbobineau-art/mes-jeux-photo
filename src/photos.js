// Import, recadrage carré, zooms et stockage IndexedDB des photos.
// Une entrée IndexedDB = { id, created, full: Blob, crops: Blob[4] }.
// En mémoire, chaque photo expose des URLs blob: prêtes pour <img> et background-image.
import { createStore, entries, set, del, clear } from 'idb-keyval';

const store = createStore('mes-jeux-photo', 'photos');
const FULL = 640, ZOOM_SRC = 380, ZOOM_OUT = 320;

/** @type {{id:string, created:number, full:string, crops:string[]}[]} */
export const photos = [];
const listeners = new Set();
export const onPhotosChange = (fn) => listeners.add(fn);
const emit = () => listeners.forEach((fn) => fn(photos));

function loadImg(src) {
  return new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src; });
}
function toBlob(cv, q) {
  return new Promise((ok, ko) => cv.toBlob((b) => (b ? ok(b) : ko(new Error('toBlob'))), 'image/jpeg', q));
}

async function processFile(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImg(url);
    const cv = document.createElement('canvas');
    cv.width = cv.height = FULL;
    const m = Math.min(img.naturalWidth, img.naturalHeight);
    cv.getContext('2d').drawImage(img, (img.naturalWidth - m) / 2, (img.naturalHeight - m) / 2, m, m, 0, 0, FULL, FULL);
    const full = await toBlob(cv, 0.85);

    const zc = document.createElement('canvas');
    zc.width = zc.height = ZOOM_OUT;
    const z = zc.getContext('2d');
    const crops = [];
    for (const [x, y] of [[0, 0], [FULL - ZOOM_SRC, 0], [0, FULL - ZOOM_SRC], [FULL - ZOOM_SRC, FULL - ZOOM_SRC]]) {
      z.drawImage(cv, x, y, ZOOM_SRC, ZOOM_SRC, 0, 0, ZOOM_OUT, ZOOM_OUT);
      crops.push(await toBlob(zc, 0.82));
    }
    return { full, crops };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function toMemory(rec) {
  return {
    id: rec.id,
    created: rec.created,
    full: URL.createObjectURL(rec.full),
    crops: rec.crops.map((b) => URL.createObjectURL(b))
  };
}
function revoke(p) { URL.revokeObjectURL(p.full); p.crops.forEach((u) => URL.revokeObjectURL(u)); }

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

export async function loadPhotos() {
  try {
    const all = (await entries(store)).map(([, v]) => v).sort((a, b) => a.created - b.created);
    photos.push(...all.map(toMemory));
  } catch (e) {
    console.warn('Lecture des photos impossible', e);
  }
  emit();
}

let persistAsked = false;
async function askPersist() {
  if (persistAsked) return;
  persistAsked = true;
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist();
  } catch { /* non bloquant */ }
}

/** Ajoute des fichiers. Renvoie { added, failed }. */
export async function addFiles(files, onProgress) {
  askPersist();
  let added = 0, failed = 0, base = Date.now();
  for (const [i, file] of [...files].entries()) {
    onProgress?.(i + 1, files.length);
    try {
      const { full, crops } = await processFile(file);
      const rec = { id: newId(), created: base + i, full, crops };
      await set(rec.id, rec, store);
      photos.push(toMemory(rec));
      added++;
    } catch (e) {
      console.warn('Photo ignorée', e);
      failed++;
    }
  }
  emit();
  return { added, failed };
}

export async function removePhoto(id) {
  const i = photos.findIndex((p) => p.id === id);
  if (i < 0) return;
  await del(id, store);
  revoke(photos[i]);
  photos.splice(i, 1);
  emit();
}

export async function removeAll() {
  await clear(store);
  photos.splice(0).forEach(revoke);
  emit();
}

export async function storageInfo() {
  try {
    const persisted = navigator.storage?.persisted ? await navigator.storage.persisted() : false;
    const est = navigator.storage?.estimate ? await navigator.storage.estimate() : null;
    return { persisted, usage: est?.usage ?? null };
  } catch {
    return { persisted: false, usage: null };
  }
}
