import { photos } from './photos.js';
import { drawings } from './drawings.js';
import { shuffle } from './utils.js';

/** n images distinctes : photos entières, puis zooms, puis dessins intégrés. */
export function pool(n) {
  const fulls = shuffle(photos.map((p) => p.full));
  const crops = shuffle(photos.flatMap((p) => p.crops));
  return [...fulls, ...crops, ...shuffle(drawings())].slice(0, n);
}

/** Images proposées pour le puzzle : toutes les photos, puis quelques dessins. */
export function puzzleChoices() {
  return [...photos.map((p) => p.full), ...drawings().slice(0, photos.length ? 3 : 6)];
}
