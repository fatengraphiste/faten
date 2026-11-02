# Photos produits – format WooCommerce

Met toutes les photos produits au même format : carré 1:1 (1200×1200 px), fond blanc,
produit centré avec la même marge de 8 % sur toutes les photos, export `.webp`.
Sur une photo déjà sur fond blanc, le produit n'est pas retouché : il est seulement recadré et centré.

- Les photos sur **fond uni clair** (blanc, gris, beige) : produit recadré et centré, même marge partout.
- Les photos sur **fond transparent** (PNG/WebP détourés) : posées sur le blanc, puis centrées.
- Les **photos de détail** (produit coupé par le cadre) : pas de recentrage, l'image entière est mise au carré.
- Les photos **décorées / d'ambiance** : aucune retouche du contenu, l'image entière est mise au carré.
- Toutes les images sortent au même format carré (1200×1200 par défaut).
- Le nom de fichier et l'arborescence des dossiers sont conservés.

## Installation

```bash
pip install numpy pillow opencv-python-headless
```

## Utilisation

```bash
python traiter_photos.py "photos_originales" "photos_traitees"
```

Options : `--taille 1200`, `--fond FFFFFF`, `--marge 0.08`, `--ombre` (désactivée par défaut), `--qualite 92`.

Voir `exemples/avant-apres.png` (haut : original, bas : résultat).
