# Mes Jeux Photo

PWA de 3 jeux pour enfants (Memory, Lynx, Puzzle) avec les photos du téléphone. Spécification : `CLAUDE.md`.

## Commandes

```bash
npm install
npm run dev       # serveur de dev (accessible sur le réseau local)
npm run build     # bundle statique dans dist/
npm run preview   # sert dist/ avec le service worker
npm run icons     # régénère les icônes PWA dans public/icons/
npm run deploy    # build + publication sur la branche gh-pages
```

`npm run deploy` suppose un dépôt git avec un remote GitHub et GitHub Pages configuré sur la branche `gh-pages`. Le build utilise `base: './'`, il fonctionne aussi tel quel sur Netlify (dossier `dist`).

## Tester sur iPhone

Le service worker exige HTTPS. Déployer d'abord (GitHub Pages ou Netlify), puis ouvrir l'URL dans Safari, Partager, « Sur l'écran d'accueil ». Couper le réseau et relancer l'app pour vérifier le hors-ligne.

## Espace parent

Maintenir le bouton « Espace parent » 2 secondes pour ajouter ou retirer des photos et lire l'écran « À propos ». Un toucher bref ne fait rien.

## Stockage

Photos dans IndexedDB (base `mes-jeux-photo`) : JPEG carré 640 px + 4 zooms 320 px par photo. `navigator.storage.persist()` est demandé au premier ajout.
