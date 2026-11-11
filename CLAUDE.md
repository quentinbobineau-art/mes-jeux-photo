# Mes Jeux Photo

PWA de 3 jeux pour enfants de 3 à 6 ans (Memory, Lynx, Puzzle). Tous les visuels se personnalisent avec des photos choisies dans la bibliothèque du téléphone. Un parent ajoute les photos, l'enfant joue.

Le prototype validé est dans `prototype/index.html` (un seul fichier, HTML/CSS/JS sans dépendance). Il sert de référence fonctionnelle et visuelle. Ne pas le modifier : le reprendre dans la vraie structure du projet.

## Objectif

Transformer le prototype en PWA installable sur l'écran d'accueil (iPhone via Safari en priorité, Android ensuite), qui fonctionne hors ligne.

## Stack

- Vite + JavaScript (ou TypeScript), sans framework UI. Le prototype est en vanilla, garder cette approche.
- `vite-plugin-pwa` pour le manifest et le service worker (précache de tous les assets, stratégie cache-first).
- IndexedDB pour stocker les photos (le prototype utilise localStorage, limité à ~5 Mo : à remplacer). Petite lib possible : `idb-keyval`.
- Appeler `navigator.storage.persist()` au premier ajout de photo pour limiter l'éviction par Safari.
- Polices auto-hébergées (Fredoka, Nunito) pour le hors-ligne, pas de Google Fonts en runtime.
- Aucun appel réseau à l'exécution. Pas de tracking, pas de pub.

## Structure cible

```
src/
  main.js            navigation accueil / jeu
  photos.js          import, recadrage carré, zooms, stockage IndexedDB
  pool.js            choix des images d'une partie
  drawings.js        dessins intégrés (canvas)
  sound.js           sons WebAudio
  confetti.js
  games/memory.js
  games/lynx.js
  games/puzzle.js
  styles/            tokens + composants
public/icons/        icônes PWA (192, 512, maskable, apple-touch-icon 180)
```

## Règles fonctionnelles (déjà implémentées dans le prototype)

Photos
- Import multiple via `<input type="file" accept="image/*" multiple>` (ouvre la photothèque sur iOS).
- Chaque photo est recadrée en carré 640 px (centre), JPEG 0,85.
- 4 zooms par photo (coins, 380 px source → 320 px) pour avoir assez d'images distinctes avec peu de photos.
- Ordre de remplissage d'une partie : photos entières, puis zooms, puis 12 dessins intégrés.
- Suppression par photo et « Tout retirer ».

Memory
- Niveaux : 3, 6, 8 paires (défaut 6). 3 colonnes pour 3 paires, 4 sinon.
- Deux cartes retournées : paire gardée (contour vert) ou retour face cachée après 950 ms.
- Compteur paires trouvées et coups. Victoire à la dernière paire.

Lynx
- Niveaux : 6, 9, 12 images. Une image cible dans un cadre, à retrouver sur le plateau.
- 5 manches, une étoile par manche. Mauvaise réponse : petite secousse, sans pénalité.

Puzzle
- Niveaux : 4, 9, 16 pièces. Choix de l'image parmi les photos (+ quelques dessins).
- Glisser-déposer une pièce sur une autre pour les échanger (Pointer Events, `touch-action: none`). Échange par deux touchers conservé en secours.
- Mélange garanti non résolu. Victoire : les pièces se rejoignent sans espace.

Commun
- Écran de victoire avec confettis, « Rejouer » et « Menu ».
- Son activable / désactivable. Respect de `prefers-reduced-motion`.
- Thème clair et sombre via tokens CSS.

## Contraintes enfants

- Cibles tactiles de 64 px minimum, aucune action importante en bas de l'écran près de la barre système.
- L'enfant ne doit pas pouvoir supprimer les photos par accident : prévoir un appui long ou une zone « parent » pour la gestion des photos.
- Pas de texte nécessaire pour jouer : consignes lisibles par le parent, jeu compréhensible sans lire.
- Empêcher le zoom et le scroll involontaires pendant les parties (`touch-action`, `user-scalable=no` sur le viewport de l'app installée).
- Mode plein écran en standalone (`display: standalone`, `apple-mobile-web-app-capable`).

## Confidentialité

Les photos ne quittent jamais l'appareil. Aucune donnée envoyée à un serveur. À rappeler dans un petit écran « À propos ».

## Déploiement

HTTPS obligatoire pour le service worker. Cible simple : GitHub Pages ou Netlify. Ajouter un script `npm run deploy`.

## Définition de « terminé »

1. `npm run dev` lance l'app, `npm run build` produit un bundle statique.
2. Les 3 jeux se comportent comme dans le prototype.
3. Installée sur iPhone (Safari, « Sur l'écran d'accueil »), l'app s'ouvre en plein écran et fonctionne en mode avion.
4. Les photos ajoutées sont toujours là après fermeture et réouverture de l'app.
5. Lighthouse PWA sans erreur bloquante.

## Pistes après la V1

- Zone parent protégée (ex. maintenir 3 s ou petit calcul).
- Albums de photos par enfant.
- Nouveau jeu : « Qui manque ? » ou coloriage à partir d'une photo.
